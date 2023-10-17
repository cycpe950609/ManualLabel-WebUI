import { CanvasBase } from "../editorUI/canvas";
import FunctionInterface from "../editorUI/interface/function";
declare class btnToggleMode implements FunctionInterface {
    Name: string;
    Tip: string;
    private toggleModeName;
    constructor(modeName: string);
    StartFunction(cvs: CanvasBase): boolean;
}
export default btnToggleMode;
