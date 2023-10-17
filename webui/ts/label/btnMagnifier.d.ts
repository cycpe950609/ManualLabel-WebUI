import { CanvasBase } from "../editorUI/canvas";
import FunctionInterface from "../editorUI/interface/function";
declare class btnMagnifier implements FunctionInterface {
    Name: string;
    ImgName: string;
    Tip: () => "Close Magnifier" | "Open Magnifier";
    private _is_show_magnifier;
    constructor();
    StartFunction(cvs: CanvasBase): boolean;
}
export default btnMagnifier;
