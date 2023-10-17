import { CanvasBase } from "../editorUI/canvas";
import FunctionInterface from "../editorUI/interface/function";
import { LabelCanvas } from "./modeLabel";

class btnShowAllNode implements FunctionInterface {
    Name = "ShowAllNodes";
    ImgName = "allnodes";
    Tip = () => this._is_show_all_nodes ? "Show editted point only" : "Show all points";

    private _is_show_all_nodes = false;

    constructor() {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StartFunction(cvs: CanvasBase) {
        let lblcvs = cvs as LabelCanvas;
        lblcvs.isShowAllNode = !this._is_show_all_nodes;
        this._is_show_all_nodes = !this._is_show_all_nodes;
        return false as boolean;
    }
}

export default btnShowAllNode;
