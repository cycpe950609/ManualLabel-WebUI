import { Unsubscribe } from "@reduxjs/toolkit";
import { ModeInfo, data } from "./data";
import { DIV, LABEL } from "./util/HTMLElement";
import { NoOPFunc } from "./interface/function";
import { NoOPCanvas } from "./canvas";

let unsubscribe: {[key:string]:Unsubscribe} = {};

export const bootstrap = async (props: ModeInfo) => {
    console.log(`[EUI] Mode ${props.modeName} bootstrapping`);
}
export const mount = async (props: ModeInfo) => {
    unsubscribe[props.modeName] = data.subscribe(() =>
    {
        // console.log("[EUI] data updated");
    });

    if (props.def.StartMode !== undefined) {
        props.def.StartMode();
    }

    if (props.def.StartMode !== undefined) {
        props.def.StartMode();
    }

    window.editorUI.CenterCanvas = props.def.CenterCanvas;// Move before toolbar so we can get correct CenterCanvas when load the toolbar
    let cnt = document.getElementById("canvas_group");
    if(cnt === null) throw new Error("INTERAL_ERROR: Container of CenterCanvas is not found");
    props.def.CenterCanvas.attachCanvas(cnt as HTMLDivElement);
    console.log("[EUI] CenterCanvas",window.editorUI.CenterCanvas)

    window.editorUI.Menubar.clear();
    window.editorUI.Menubar.Left.addButtonList(props.def.MenuToolbarLeft);
    window.editorUI.Menubar.Right.addButtonList(props.def.MenuToolbarRight);

    window.editorUI.Toolbar.clear();
    window.editorUI.Toolbar.Top.addButtonList(props.def.LeftToolbarTop);
    window.editorUI.Toolbar.Bottom.addButtonList(props.def.LeftToolbarBottom);

    window.editorUI.Sidebar.clear();
    window.editorUI.Sidebar.Top.addButtonList(props.def.RightToolbarTop);
    window.editorUI.Sidebar.Bottom.addButtonList(props.def.RightToolbarBottom);
    
    let funcNoop = new NoOPFunc(0);
    window.editorUI.Mode.changeFunction(funcNoop);

    console.log(`[EUI] Mode ${props.modeName} mounted`);
}
export const unmount = async (props: ModeInfo) => {
    unsubscribe[props.modeName]();
    delete unsubscribe[props.modeName];
    if(props.def.EndMode !== undefined)
        props.def.EndMode()
    props.def.CenterCanvas.removeCanvas();
    let cnt = document.getElementById("canvas_group");
    if(cnt === null) throw new Error("INTERAL_ERROR: Container of CenterCanvas is not found");
    cnt.innerHTML = "";

    window.editorUI.CenterCanvas = undefined;
    window.editorUI.Menubar.Left.clear();
    window.editorUI.Menubar.Right.clear();
    window.editorUI.Toolbar.clear();
    window.editorUI.Sidebar.clear();
    window.editorUI.Statusbar.clear();
};