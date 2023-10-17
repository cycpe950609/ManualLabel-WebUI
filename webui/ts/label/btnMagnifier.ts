import { CanvasBase } from "../editorUI/canvas";
import Dialog from "../editorUI/dialog";
import FunctionInterface from "../editorUI/interface/function";
import { DIV, SPAN } from "../editorUI/util/HTMLElement";
import { LabelCanvas } from "./modeLabel";

class btnMagnifier implements FunctionInterface {
    Name = "Magnifier";
    ImgName = "magnifier";
    Tip = () => this._is_show_magnifier ? "Close Magnifier" : "Open Magnifier";
    private _is_show_magnifier = false;
    constructor() {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StartFunction(cvs: CanvasBase) {
        let lblcvs = cvs as LabelCanvas;
        lblcvs.isMagnifier = !this._is_show_magnifier;
        this._is_show_magnifier = !this._is_show_magnifier;
        return false as boolean;
    }
}

export default btnMagnifier;
