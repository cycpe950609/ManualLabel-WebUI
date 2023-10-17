import { CanvasBase } from "../editorUI/canvas";
import Dialog from "../editorUI/dialog";
import FunctionInterface from "../editorUI/interface/function";
import { DIV, SPAN } from "../editorUI/util/HTMLElement";
import { LabelCanvas } from "./modeLabel";

class btnGray implements FunctionInterface {
    Name = "Gray";
    ImgName = "gray";
    Tip = () => this._is_gray_scale ? "Show Original Image" : "Show GrayScale Image";
    constructor() {}

    private _is_gray_scale = false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StartFunction(cvs: CanvasBase) {
        let lblcvs = cvs as LabelCanvas;
        lblcvs.isGrayScale = !this._is_gray_scale;
        this._is_gray_scale = !this._is_gray_scale;
        return false as boolean;
    }
}

export default btnGray;
