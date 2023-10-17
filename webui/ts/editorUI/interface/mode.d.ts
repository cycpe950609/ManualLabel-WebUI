import { CanvasBase, NoOPCanvas } from "../canvas";
import FunctionInterface from "./function";
import SidebarInterface from "./sidebar";
export interface ModeFunction {
    ModeSelectorText?: string;
    Tips?: string;
    Enable: boolean;
    MenuToolbarLeft?: FunctionInterface[];
    MenuToolbarRight?: FunctionInterface[];
    LeftToolbarTop?: FunctionInterface[];
    LeftToolbarBottom?: FunctionInterface[];
    RightToolbarTop?: SidebarInterface[];
    RightToolbarBottom?: SidebarInterface[];
    CenterCanvas: CanvasBase;
    StartMode?: () => void;
    EndMode?: () => void;
}
export default ModeFunction;
export declare class modeNoop implements ModeFunction {
    ModeName: string;
    Enable: boolean;
    CenterCanvas: NoOPCanvas;
}
