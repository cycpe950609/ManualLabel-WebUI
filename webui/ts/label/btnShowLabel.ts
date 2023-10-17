import { CanvasBase } from "../editorUI/canvas";
import FunctionInterface from "../editorUI/interface/function";
import { LabelCanvas } from "./modeLabel";

class btnShowLabel implements FunctionInterface {
    Name = "ShowLabel";
    ImgName = "label";
    Tip = () => this._is_show_label ? "Hide Index" : "Show Index of drawn points";

    private _is_show_label:boolean = false;
    constructor() {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StartFunction(cvs: CanvasBase) {
        let lblcvs = cvs as LabelCanvas;
        lblcvs.isShowLabel = !this._is_show_label;
        this._is_show_label = !this._is_show_label
        return false as boolean;
    }
}

export default btnShowLabel;
