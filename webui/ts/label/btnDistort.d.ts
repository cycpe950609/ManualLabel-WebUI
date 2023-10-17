import { CanvasBase } from "../editorUI/canvas";
import FunctionInterface from "../editorUI/interface/function";
declare class btnDistort implements FunctionInterface {
    Name: string;
    ImgName: string;
    Tip: () => "Show Original Image" | "Show Undistored Image";
    constructor();
    private _is_undistorted;
    StartFunction(cvs: CanvasBase): boolean;
}
export default btnDistort;
