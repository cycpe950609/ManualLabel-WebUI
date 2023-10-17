import * as singleSpa from 'single-spa';
import editoruiTemplate from "./editorui.html"
import FunctionInterface, { NoOPFunc } from './interface/function';
import Toolbar, { ToolbarInterface, ToolbarPart } from './toolbar';
// import SidebarInterface from './interface/sidebar';
import ModeFunction, { modeNoop } from './interface/mode';
import { DIV, LABEL, SPAN } from './util/HTMLElement';
import {ModeInfo, data, modeAdd, modeDisable, modeEnable, modeRemove, modeSetRoot, modeToggle} from './data';
import SidebarInterface from './interface/sidebar';
import Sidebar from './sidebar';
import { CanvasBase, NoOPCanvas } from './canvas';
import StatusBar from './statusbar';
import './util/console';

declare global {
    interface Window { 
        editorUI: EditorUI; 
    }
}
class ModeManger {
    // private modeList: Map<string, ModeInfo> = new Map<string, ModeInfo>();
    private selectorBtn: Map<string, HTMLLabelElement> = new Map<
        string,
        HTMLLabelElement
    >();
    private func_mode = "noop";

    private funcNoop: FunctionInterface = new NoOPFunc(0);
    private func: FunctionInterface = this.funcNoop;

    constructor() {}

    currentMode(): string {
        return this.func_mode;
    }

    enable(modeName: string) {
        data.dispatch(modeEnable(modeName));
    }
    disable(modeName: string) {
        data.dispatch(modeDisable(modeName));
    }
    toggle(modeName: string) {
        data.dispatch(modeToggle(modeName));
    }

    add(modeName: string, modeFunc: ModeFunction, enabled?: boolean) {
        if (modeName in data.getState()["mode"].data) throw new Error("Mode " + modeName + " exist");
        if (!(modeName in data.getState()["mode"].data)) {
            let modeNameHash = `#/${modeName}`;

            data.dispatch(modeAdd({
                def: modeFunc,
                enable: enabled !== undefined ? enabled : modeFunc.Enable,
                modeName: modeName,
                btn: document.createElement("label")
            }));
            // this.modeList.set(name, mode);
            // console.log("[EUI] Mode is enable : ",(data.getState()['mode'][modeNameHash] as ModeInfo).enable )
            const modeInfo: ModeInfo = {
                def: modeFunc,
                enable: enabled !== undefined ? enabled : modeFunc.Enable,
                modeName: modeName,
            };
            if(data.getState().mode.root === "")
                data.dispatch(modeSetRoot(modeNameHash));
            singleSpa.registerApplication({
                name: `mode_${modeName}`, // 子应用名
                app: () => import("./mode"), // 如何加载你的子应用
                // activeWhen: `index.html#/${name}`, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
                activeWhen: (url:Location) => {
                    console.log("[EUI] Url hash" , url.hash,modeNameHash,modeNameHash in data.getState()['mode'].data);
                    return url.hash === `#/${modeName}` && 
                    modeNameHash in data.getState()['mode'].data &&
                    (data.getState()['mode'].data[modeNameHash] as ModeInfo).enable === true
                }, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
                customProps : modeInfo
            });
            
        }
        console.log("[EUI] Add mode " + modeName);
    }
    remove(name: string) {
        data.dispatch(modeRemove(name));
    }

    changeFunction(next_func: FunctionInterface) {
        if (this.func.EndFunction !== undefined) {
            this.func.EndFunction(window.editorUI.CenterCanvas);
            // this.mdfunc.CenterCanvas.render();
        }

        const ifChangFunc = next_func.StartFunction(window.editorUI.CenterCanvas);
        window.editorUI.CenterCanvas.render();
        if (ifChangFunc === true) this.func = next_func;
    }

    changeTo(modeName: string) {
        console.log("[MOD] Before change mode to " + modeName);
        if (this.func_mode === modeName) return;

        let modeNameHash = `#/${modeName}`;
        // console.log(modeNameHash in data.getState()["mode"].data && data.getState()["mode"].data[modeNameHash].enable !== true)
        if (
            modeNameHash in data.getState()["mode"].data &&
            data.getState()["mode"].data[modeNameHash].enable !== true
        )
            return;
        console.log(`[MOD] Change mode to ${modeName} 2`);

        singleSpa.navigateToUrl(`#/${modeName}`)
        console.log("[MOD] Change mode to " + modeName);
    }
}

class Menubar {
    public Left: ToolbarPart<FunctionInterface>;
    public Right: ToolbarPart<FunctionInterface>;

    constructor() {
        this.Left = new ToolbarPart<FunctionInterface>("menubar_left_");
        this.Right = new ToolbarPart<FunctionInterface>("menubar_right_");
    }

    removeButton(id: string) {
        if (!this.Left.removeButton(id)) 
            this.Right.removeButton(id);
    }

    clear() {
        this.Left.clear();
        this.Right.clear();
    }

    size() {
        return this.Right.size() + this.Left.size();
    }
    hasChildren() {
        const rightHasChildren = this.Right.hasChildren();
        const leftHasChildren = this.Left.hasChildren();
        // console.log("Bottom : ",bottomHasChildren , "Top : " ,topHasChildren);
        return rightHasChildren || leftHasChildren;
    }
}

class EditorUI {
    public Toolbar: Toolbar<FunctionInterface>;
    public Sidebar: Toolbar<SidebarInterface>;
    public Menubar: Menubar;
    public Mode: ModeManger;
    public Statusbar: StatusBar;
    // public Permanent: PermanentManager;
    private noop_cvs: CanvasBase = new NoOPCanvas();
    private cvs:CanvasBase = this.noop_cvs;
    public get CenterCanvas(): CanvasBase{
        return this.cvs;
    }
    public set CenterCanvas(cvs:CanvasBase | undefined) {
        this.cvs = cvs !== undefined ? cvs : this.noop_cvs;
    }

    private container = document.createElement("div");

    constructor() {
        this.container.innerHTML = editoruiTemplate;

        this.Toolbar = new Toolbar<FunctionInterface>("toolbar","",(listName: string,key: string,func: FunctionInterface) => func);
        singleSpa.registerApplication({
            name: 'toolbar_left', // 子应用名
            app: () => import("./toolbar"), // 如何加载你的子应用
            // activeWhen: `index.html#/${name}`, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            activeWhen: '/', //(url) => true, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            customProps: {type: "toolbar"}
        })

        this.Sidebar = new Toolbar<SidebarInterface>("sidebar","",(listName: string,key: string,func: SidebarInterface) => { console.log("[EUI] Create sidebar funcInterface"); return new Sidebar(listName,key,func)});
        singleSpa.registerApplication({
            name: 'toolbar_right', // 子应用名
            app: () => import("./toolbar"), // 如何加载你的子应用
            // activeWhen: `index.html#/${name}`, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            activeWhen: '/', //(url) => true, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            customProps: {type: "sidebar"}
        })
        singleSpa.registerApplication({
            name: 'sidebar_window', // 子应用名
            app: () => import("./sidebar"), // 如何加载你的子应用
            // activeWhen: `index.html#/${name}`, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            activeWhen: '/', //(url) => true, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
        })

        this.Statusbar = new StatusBar();
        singleSpa.registerApplication({
            name: 'statusbar_left', // 子应用名
            app: () => import("./statusbar"), // 如何加载你的子应用
            // activeWhen: `index.html#/${name}`, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            activeWhen: '/', //(url) => true, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            customProps: {side: "left"}
        })
        singleSpa.registerApplication({
            name: 'statusbar_right', // 子应用名
            app: () => import("./statusbar"), // 如何加载你的子应用
            // activeWhen: `index.html#/${name}`, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            activeWhen: '/', //(url) => true, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            customProps: {side: "right"}
        })

        this.Menubar = new Menubar();
        singleSpa.registerApplication({
            name: 'menubar_left', // 子应用名
            app: () => import("./menubox"), // 如何加载你的子应用
            // activeWhen: `index.html#/${name}`, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            activeWhen: '/', //(url) => true, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            customProps: {side: "left"}
        })
        singleSpa.registerApplication({
            name: 'menubar_right', // 子应用名
            app: () => import("./menubox"), // 如何加载你的子应用
            // activeWhen: `index.html#/${name}`, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            activeWhen: '/', //(url) => true, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            customProps: {side: "right"}
        })

        this.Mode = new ModeManger();
        singleSpa.registerApplication({
            name: 'mode_selector', // 子应用名
            app: () => import("./modeSelector"), // 如何加载你的子应用
            // activeWhen: `index.html#/${name}`, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            activeWhen: '/', //(url) => true, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
        })

        singleSpa.registerApplication({
            name: 'error_handler_page', // 子应用名
            app: () => import("./errorPage"), // 如何加载你的子应用
            // activeWhen: `index.html#/${name}`, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
            activeWhen: (url:Location) => {
                let isNotExistPath = !(url.hash in data.getState()["mode"].data);
                let isDisableMode = (url.hash in data.getState()["mode"].data && data.getState()["mode"].data[url.hash].enable === false)
                return isNotExistPath || isDisableMode;
            }, //(url) => true, // url 匹配规则，表示啥时候开始走这个子应用的生命周期
        })
    }

    public Mount(container: string|HTMLDivElement) {
        let _cnt = document.createElement('div');
        if(typeof container === 'string'){
            let tmp = document.getElementById(container);
            if(tmp === null) throw new Error("INTERNAL_ERROR: Cannt found container");
            _cnt = tmp as HTMLDivElement; 
        }
        else {
            _cnt = container;
        }
        _cnt.appendChild(this.container);
        singleSpa.start();
        console.log("[EUI] EditorUI Mounted");
    }
}

export default EditorUI;