import EditorUI from "./EditorUI";
import { v4 as uuidv4 } from "uuid";
import { Unsubscribe } from "@reduxjs/toolkit";
import { ToolbarStateType, data, editorUIActions } from "./data";
import { DIV, LABEL, SPAN } from "./util/HTMLElement";
import FunctionInterface from "./interface/function";
import createFunctionInterfaceButton from "./util/createFunctionInterfaceButton";

export interface ToolbarInterface {
    hide: () => void;
    show: () => void;
    size: () => number;
    hasChildren: () => boolean;
}

export type createFuncType<ButtonInfoType> = (listName:string,name: string,arg0: ButtonInfoType) => FunctionInterface

export class ToolbarPart<ButtonInfoType> {
    private name: string;

    constructor(
        name: string
    ) {
        this.name = name;
    }
    clear() {
        console.log(`[EUI] Toolbar ${this.name} clear`);
        // console.log(Object.id(this) + " is cleared");
        data.dispatch(editorUIActions[this.name].clear(undefined));
    }

    addButtonList(funcList?: ButtonInfoType[]): string[] {
        if (funcList === undefined || funcList.length === 0) return [];
        return funcList.map((func: ButtonInfoType) => {
            return this.addButton(func);
        });
    }

    addButton(func: ButtonInfoType): string {
        const btnID = uuidv4();
        data.dispatch(editorUIActions[this.name].add({id:btnID,func: func}));
        return btnID;
    }

    removeButton(id: string): boolean {
        if (id in data.getState()[this.name]) {
            data.dispatch(editorUIActions[this.name].remove(id));
            return true;
        }
        return false;
    }

    size() {
        // console.log(this.button);
        return Object.keys(data.getState()[this.name]).length;
    }
    hasChildren() {
        return Object.keys(data.getState()[this.name]).length > 0;
    }
}
class Toolbar<ButtonInfoType> {
    public Top: ToolbarPart<ButtonInfoType>;
    public Bottom: ToolbarPart<ButtonInfoType>;

    constructor(
        prefix: string,
        postfix: string,
        createFunc: createFuncType<ButtonInfoType>
    ) {
        createFuncList[prefix] = createFunc;
        this.Top = new ToolbarPart<ButtonInfoType>(
            `${prefix}_top_${postfix}`
        );
        this.Bottom = new ToolbarPart<ButtonInfoType>(
            `${prefix}_bottom_${postfix}`
        );
    }

    removeButton(id: string) {
        if (!this.Top.removeButton(id)) 
            this.Bottom.removeButton(id);
    }

    clear() {
        this.Top.clear();
        this.Bottom.clear();
    }

    size() {
        return this.Bottom.size() + this.Top.size();
    }
    hasChildren() {
        const bottomHasChildren = this.Bottom.hasChildren();
        const topHasChildren = this.Top.hasChildren();
        // console.log("Bottom : ",bottomHasChildren , "Top : " ,topHasChildren);
        return bottomHasChildren || topHasChildren;
    }
}

export default Toolbar;

// Toolbar application form single-spa

let unsubscribe: {[key:string]:Unsubscribe} = {};
let createFuncList : {[key:string]:createFuncType<any>} = {};
let rendered : {[key:string]:boolean} = {};
export type ToolbarPropsType = {
    type: string;
}
export const bootstrap = async (props: ToolbarPropsType) => {
    console.log("[EUI] Toolbar bootstrapping");
    let underscore      = props.type.replace('-','_');
    rendered[`${underscore}_top_`] = false;
    rendered[`${underscore}_top_perm`] = false;
    rendered[`${underscore}_bottom_`] = false;
    rendered[`${underscore}_bottom_perm`] = false;
}

const renderToolPart = (type:string,partName: string,partListName:string,partList: ToolbarStateType<any>) => {
    console.log("[EUI] ToolbarPart render", partListName, Object.keys(partList).length)
    return DIV(partName,
        Object.keys(partList).map((key:string) => {
            rendered[partListName] = true;
            return createFunctionInterfaceButton(createFuncList[type](partListName,key,partList[key]));
        })
    );
}

const render = (type: string) => {
    let name = `editorui-${type}`;
    let cnt = document.getElementById(name);
    if(cnt === null) throw new Error(`INTERNAL_ERROR: Container of ${type} not found`);

    let underscore      = type.replace('-','_');
    let dataTop         = data.getState()[`${underscore}_top_`].data;
    let dataTopPerm     = data.getState()[`${underscore}_top_perm`].data;
    let dataBottom      = data.getState()[`${underscore}_bottom_`].data;
    let dataBottomPerm  = data.getState()[`${underscore}_bottom_perm`].data;
    // <div class="toolbar-vertical" style="display: flex;">
    //      <div class="toolbar-perm"></div>
    //      <div class="toolbar-top">
    //          <div class="toolbar-item" style="background-image: url(&quot;img/brush.png&quot;);"><span class="tooltip-text"></span></div>
    //      </div>
    //      <div class="toolbar-bottom"></div>
    //      <div class="toolbar-perm"></div>
    // </div>
    cnt.innerHTML = ""
    if(
        Object.keys(dataTop         ).length +
        Object.keys(dataTopPerm     ).length +
        Object.keys(dataBottom      ).length +
        Object.keys(dataBottomPerm  ).length 
        === 0
    )
    {
        let newCNt = document.createElement("div");
        newCNt.id = name;
        cnt.parentNode?.replaceChild(newCNt,cnt);
        return;
    }
    let toolbar = DIV("toolbar-vertical",[
        renderToolPart(type,"toolbar-perm",`${underscore}_top_perm`,dataTopPerm),
        renderToolPart(type,"toolbar-top",`${underscore}_top_`,dataTop),
        renderToolPart(type,"toolbar-bottom",`${underscore}_bottom_`,dataBottom),
        renderToolPart(type,"toolbar-perm",`${underscore}_bottom_perm`,dataBottomPerm)
    ]);
    toolbar.id = name;
    cnt.parentNode?.replaceChild(toolbar,cnt);
}
export const mount = async (props: ToolbarPropsType) => {
    unsubscribe[props.type] = data.subscribe(() =>
    {
        // console.log(`[EUI] data updated : toolbar ${props.type}`,data.getState());
        let underscore      = props.type.replace('-','_');
        if(
            (
                rendered[`${underscore}_top_`]          === false && data.getState()[`${underscore}_top_`].action !== ""         ||
                rendered[`${underscore}_top_perm`]      === false && data.getState()[`${underscore}_top_perm`].action !== ""     ||
                rendered[`${underscore}_bottom_`]       === false && data.getState()[`${underscore}_bottom_`].action !== ""      ||
                rendered[`${underscore}_bottom_perm`]   === false && data.getState()[`${underscore}_bottom_perm`].action !== ""  
            )
        )
        {
            // console.log(`${props.type} rerendered`);
            
            render(props.type);
        }
        
        [
            `${underscore}_top_`,
            `${underscore}_top_perm`,
            `${underscore}_bottom_`,
            `${underscore}_bottom_perm`,
        ].forEach((name) => {
            if(data.getState()[name].action !== "" && rendered[name] === true){
                rendered[name] = false;
                data.dispatch(editorUIActions[name].rendered(null));
            }
        })

    });
    render(props.type);
    console.log(`[EUI] Toolbar ${props.type} mounted`);
}
export const unmount = async (props: ToolbarPropsType) => {unsubscribe[props.type]();};
