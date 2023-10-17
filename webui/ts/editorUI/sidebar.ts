import { Unsubscribe } from "@reduxjs/toolkit";
import { CanvasBase } from "./canvas";
import { ToolbarStateType, data, editorUIActions } from "./data";
import EditorUI from "./EditorUI";
import FunctionInterface from "./interface/function";
import SidebarInterface from "./interface/sidebar";
import { DIV, SPAN } from "./util/HTMLElement";
import { LabelCanvas } from "../label/modeLabel";
import {
    init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    h,
    toVNode,
    VNode,
} from "snabbdom";
import { HDIV, HSPAN } from "./util/HHTMLElement";

const patchSidebar = init([
    // Init patch function with chosen modules
    classModule, // makes it easy to toggle classes
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
    eventListenersModule, // attaches event listeners
]);

class Sidebar implements FunctionInterface {
    Name: string;
    ImgName?: string;
    Tip?: string;

    private listName: string;
    private interfaceUUID: string;

    constructor(
        listName: string,
        uuid: string,
        sidebar: SidebarInterface
    ) {
        this.listName = listName;
        this.interfaceUUID = uuid;

        this.Name = sidebar.Name;
        this.ImgName = sidebar.ImgName;
        this.Tip = sidebar.Tip;
    }

    showSidebar() {
        let curSideInterface = data.getState()[this.listName].data[this.interfaceUUID];
        if(curSideInterface.Visible === true) return;
        curSideInterface.Visible = true;
        data.dispatch(editorUIActions[this.listName].update({id:this.interfaceUUID,new_func:curSideInterface}))
    }

    hiddenSidebar() {
        let curSideInterface = data.getState()[this.listName].data[this.interfaceUUID];
        if(curSideInterface.Visible === false) return;
        curSideInterface.Visible = false;
        data.dispatch(editorUIActions[this.listName].update({id:this.interfaceUUID,new_func:curSideInterface}))
    }

    toggleSidebar() {
        let curSideInterface = data.getState()[this.listName].data[this.interfaceUUID];
        let isShowSidebar = !curSideInterface.Visible;
        if (isShowSidebar === true) this.showSidebar();
        else this.hiddenSidebar();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StartFunction(/*cvs: CanvasBase*/) {
        this.toggleSidebar();
        return false;
    }
}

export default Sidebar;

let unsubscribe: Unsubscribe;
export const bootstrap = async () => {
    console.log("[EUI] modeSelector bootstrapping");
}
let windowCache: {[key:string]:VNode} = {};
let renderWindow = (uuid:string): VNode => {
    if(uuid in windowCache && !window.editorUI.CenterCanvas.isUpdate) return windowCache[uuid];

    let sidebarImple = undefined;
    if(uuid in data.getState()['sidebar_top_'].data)
        sidebarImple = data.getState()['sidebar_top_'].data[uuid];
    else if(uuid in data.getState()['sidebar_top_perm'].data)
        sidebarImple = data.getState()['sidebar_top_perm'].data[uuid];
        else if(uuid in data.getState()['sidebar_bottom_'].data)
        sidebarImple = data.getState()['sidebar_bottom_'].data[uuid];
    else if(uuid in data.getState()['sidebar_bottom_perm'].data)
        sidebarImple = data.getState()['sidebar_bottom_perm'].data[uuid];
    if(sidebarImple === undefined) throw new Error("INTERNAL_ERROR: SidebarInterface is not found");
    
    let sidebar = h("div#divcnt.property-bar",
    { style : {pointerEvents: "auto"} },
    [
        HDIV("pd_title", 
            HSPAN("pb_Property_title", sidebarImple.Title() )),
        HDIV("pb_Property_bdy", sidebarImple.Body())
    ]);
    return sidebar
}
const renderSidebarPart = (partList: ToolbarStateType<SidebarInterface>) : VNode => {
    return h("div#cnt.w-fit.h-fit",
        Object.keys(partList).map((key:string) => {
            if(partList[key].Visible === false){
                if(key in windowCache)
                    delete windowCache[key];
                return h("div");
            }
            
            return renderWindow(key);
        })
    );
}

let cntSidebar:HTMLDivElement;
let lastSidebarVNode:VNode;

const render = () => {
    if(cntSidebar == null) {
        let cnt = document.getElementById("editorui-sidebar-windows");
        if(cnt === null) throw new Error(`INTERNAL_ERROR: Container of Sidebar-Window not found`);
        cntSidebar = cnt as HTMLDivElement;
        lastSidebarVNode = toVNode(cntSidebar);
    }
    let dataTop         = data.getState()[`sidebar_top_`].data;
    let dataTopPerm     = data.getState()[`sidebar_top_perm`].data;
    let dataBottom      = data.getState()[`sidebar_bottom_`].data;
    let dataBottomPerm  = data.getState()[`sidebar_bottom_perm`].data;
    
    // <div class="sidebar" id="editorui-sidebar-windows">
    let visiableCount = (partList: ToolbarStateType<SidebarInterface>) => {
        let count = 0;
        Object.keys(partList).forEach((key) => {
            count += partList[key].Visible ? 1 : 0;
        })
        return count;
    }
    let windowCount =   visiableCount(dataTop) + 
                        visiableCount(dataBottom) + 
                        visiableCount(dataTopPerm) + 
                        visiableCount(dataBottomPerm);
    
    let sidebar = h("div#editorui-sidebar-windows.sidebar",
    {
        style : {pointerEvents: (windowCount > 0) ? "auto" : "none"}
    },
    [
        renderSidebarPart(dataTop         ),
        renderSidebarPart(dataTopPerm     ),
        renderSidebarPart(dataBottom      ),
        renderSidebarPart(dataBottomPerm  ),
    ])
    
    // console.log("[DEB]", sidebar)
    patchSidebar(lastSidebarVNode,sidebar);
    lastSidebarVNode = sidebar;
    window.editorUI.CenterCanvas.isUpdate = false;
}
export const mount = async () => {
    unsubscribe = data.subscribe(() =>
    {
        console.log("[EUI] Sidebar-Window updated");
        render();
    });
    render();
    console.log("[EUI] Sidebar-Window mounted");
}
export const unmount = async () => {unsubscribe();};