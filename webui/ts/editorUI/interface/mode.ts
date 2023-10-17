import { CanvasBase, NoOPCanvas } from "../canvas";
import FunctionInterface from "./function";
import SidebarInterface from "./sidebar";

export interface ModeFunction {
    ModeSelectorText?: string; //undefine if no need to show in selector
    Tips?: string;
    Enable: boolean; // Default status of Mode when created
    MenuToolbarLeft?: FunctionInterface[];
    // Middle is mode selector
    MenuToolbarRight?: FunctionInterface[];
    LeftToolbarTop?: FunctionInterface[];
    LeftToolbarBottom?: FunctionInterface[];

    RightToolbarTop?: SidebarInterface[];
    RightToolbarBottom?: SidebarInterface[];

    CenterCanvas: CanvasBase;

    // triggered when click selector of this mode,
    // load data from stored 3dl file
    StartMode?: () => void;

    // triggered when click selector of OTHER mode,
    // should flush all state into storge if need save in 3dl file
    EndMode?: () => void;
}

export default ModeFunction;

export class modeNoop implements ModeFunction {
    ModeName = "NoOP";
    Enable = false;
    CenterCanvas = new NoOPCanvas();
}
