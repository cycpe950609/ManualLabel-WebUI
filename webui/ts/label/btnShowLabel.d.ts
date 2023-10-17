import { CanvasBase } from "../editorUI/canvas";
import FunctionInterface from "../editorUI/interface/function";
declare class btnShowLabel implements FunctionInterface {
    Name: string;
    ImgName: string;
    Tip: () => "Hide Index" | "Show Index of drawn points";
    private _is_show_label;
    constructor();
    StartFunction(cvs: CanvasBase): boolean;
}
export default btnShowLabel;
