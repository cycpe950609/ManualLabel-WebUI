import { CanvasBase } from "../editorUI/canvas";
import FunctionInterface from "../editorUI/interface/function";
declare class btnShowAllNode implements FunctionInterface {
    Name: string;
    ImgName: string;
    Tip: () => "Show editted point only" | "Show all points";
    private _is_show_all_nodes;
    constructor();
    StartFunction(cvs: CanvasBase): boolean;
}
export default btnShowAllNode;
