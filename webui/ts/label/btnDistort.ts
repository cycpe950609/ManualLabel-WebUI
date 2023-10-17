import { CanvasBase } from "../editorUI/canvas";
import Dialog from "../editorUI/dialog";
import FunctionInterface from "../editorUI/interface/function";
import { DIV, SPAN } from "../editorUI/util/HTMLElement";
import { LabelCanvas } from "./modeLabel";

class btnDistort implements FunctionInterface {
    Name = "Distort";
    ImgName = "distort";
    Tip = () => this._is_undistorted ? "Show Original Image" : "Show Undistored Image";
    constructor() {}

    private _is_undistorted = true;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StartFunction(cvs: CanvasBase) {
        let lblcvs = cvs as LabelCanvas;
        lblcvs.isDistortion = !this._is_undistorted;
        this._is_undistorted = !this._is_undistorted;
        return false as boolean;
    }
}

export default btnDistort;
