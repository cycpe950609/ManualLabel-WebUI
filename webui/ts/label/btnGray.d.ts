import { CanvasBase } from "../editorUI/canvas";
import FunctionInterface from "../editorUI/interface/function";
declare class btnGray implements FunctionInterface {
    Name: string;
    ImgName: string;
    Tip: () => "Show Original Image" | "Show GrayScale Image";
    constructor();
    private _is_gray_scale;
    StartFunction(cvs: CanvasBase): boolean;
}
export default btnGray;
