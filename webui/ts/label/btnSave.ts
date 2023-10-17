import { CanvasBase } from "../editorUI/canvas";
import Dialog from "../editorUI/dialog";
import FunctionInterface from "../editorUI/interface/function";
import { SPAN } from "../editorUI/util/HTMLElement";
import { manuallabel } from "../main";

class btnSave implements FunctionInterface {
    Name = "Save";
    ImgName = "save";
    Tip = "Save Current WrongSet";

    constructor() {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StartFunction() {
        saveWrongSet();
        return false;
    }
}

export const saveWrongSet = async () => { 
    await window.backend.api.saveWrongSet();
    let dia = new Dialog("Success",SPAN("whitespace","WrongSet saved successfully"));
    dia.show();
};

export default btnSave;
