import { Unsubscribe } from "@reduxjs/toolkit";
import { ToolbarStateType, data, editorUIActions } from "./data";
import { DIV } from "./util/HTMLElement";
import createFunctionInterfaceButton from "./util/createFunctionInterfaceButton";

// Menubar application form single-spa

let unsubscribe: {[key:string]:Unsubscribe} = {};
let rendered : {[key:string]:boolean} = {};

export type MenubarPropsType = {
    side: string;
}
export const bootstrap = async (props: MenubarPropsType) => {
    console.log("[EUI] Toolbar bootstrapping");
    rendered[`menubar_${props.side}_`]      = false; 
    rendered[`menubar_${props.side}_perm`]  = false; 
}
const renderMenuPart = (partListName: string, partList: ToolbarStateType<any>) => {
    return DIV("meanu-perm",
        Object.keys(partList).map((key:string) => {
            rendered[partListName] = true;
            return createFunctionInterfaceButton(partList[key]);
        })
    );
}

const render = (side: string) => {
    let name = `editorui-menubar-${side}`;
    let cnt = document.getElementById(name);
    if(cnt === null) throw new Error(`INTERNAL_ERROR: Container of menubar ${side} part not found`);
    
    let dataMode    = data.getState()[`menubar_${side}_`].data;
    let dataPerm    = data.getState()[`menubar_${side}_perm`].data;
    cnt.innerHTML = ""
    if(
        Object.keys(dataMode).length +
        Object.keys(dataPerm).length
        === 0
    )
    {
        let newCNt = document.createElement("div");
        newCNt.id = name;
        cnt.parentNode?.replaceChild(newCNt,cnt);
        return;
    }
    // <div class="menu-box" style="display: flex;">
    //      <div class="menu-perm">
    //          <div class="toolbar-item" style="background-image: url(&quot;img/eraser.png&quot;);"><span
    //                  class="tooltip-text">Eraser</span></div>
    //      </div>
    //      <div class="menu-perm"></div>
    // </div>
    let toolbar = DIV("menu-box",[
        renderMenuPart(`menubar_${side}_perm`,dataPerm),
        renderMenuPart(`menubar_${side}_`,dataMode),
    ]);
    toolbar.id = name;
    cnt.parentNode?.replaceChild(toolbar,cnt);
}
export const mount = async (props: MenubarPropsType) => {
    unsubscribe[props.side] = data.subscribe(() =>
    {
        if(
            (
                rendered[`menubar_${props.side}_perm`]  === false && data.getState()[`menubar_${props.side}_perm`].action !== ""         ||
                rendered[`menubar_${props.side}_`]      === false && data.getState()[`menubar_${props.side}_`].action !== "" 
            )
        )
        {
            // console.log(`MenuBox ${props.side} rerendered`);
            
            render(props.side);
        }
        
        [
            `menubar_${props.side}_perm`,
            `menubar_${props.side}_`
        ].forEach((name) => {
            if(data.getState()[name].action !== "" && rendered[name] === true){
                rendered[name] = false;
                data.dispatch(editorUIActions[name].rendered(null));
            }
        })
    });
    render(props.side);
    console.log(`[EUI] Menubar ${props.side} mounted`);
}
export const unmount = async (props: MenubarPropsType) => {unsubscribe[props.side]();};