import { CanvasBase, CanvasInterface } from "../editorUI/canvas";
import ModeFunction from "../editorUI/interface/mode";
import FunctionInterface from "../editorUI/interface/function";
import SidebarInterface from "../editorUI/interface/sidebar";
import btnInfo from "../util/btnInfo";
import btnDistort from "./btnDistort";
import btnSave from "./btnSave";
import btnShowLabel from "./btnShowLabel";
import btnShowAllNode from "./btnShowAllNode";
import btnMagnifier from "./btnMagnifier";
import btnGray from "./btnGray";
import { VNode } from "snabbdom";
declare class btnGridShape implements FunctionInterface {
    Name: string;
    ImgName: string;
    Tip: string;
    StartFunction(cvs: CanvasBase): boolean;
}
declare class btnScale implements FunctionInterface {
    Name: string;
    ImgName: string;
    Tip: () => string;
    private scale;
    constructor(image: string, scaleFunc: (lastScale: number) => number);
    StartFunction(cvs: CanvasBase): boolean;
}
declare class btnScrollToPoint implements FunctionInterface {
    Name: string;
    ImgName: string;
    Tip: string;
    constructor();
    StartFunction(cvs: CanvasBase): boolean;
}
declare class sidebarHelp implements SidebarInterface {
    Name: string;
    ImgName: string;
    Tip: string;
    Visible: boolean;
    Title: () => string;
    Body: () => VNode;
}
declare class sidebarAllNodes implements SidebarInterface {
    constructor();
    Name: string;
    ImgName: string;
    Tip: string;
    Visible: boolean;
    Title: () => string;
    Body: (cvs?: CanvasBase) => VNode;
}
declare class sidebarAllWrongSet implements SidebarInterface {
    constructor();
    Name: string;
    ImgName: string;
    Tip: string;
    Visible: boolean;
    Title: () => string;
    Body: () => VNode;
}
export declare let opened_wrong_set: string;
export declare class LabelCanvas implements CanvasBase {
    setFunction: (func: CanvasInterface) => void;
    update?: ((time: number) => void) | undefined;
    name: string;
    private wrong_image_shape;
    private scrollDiv;
    private infoDiv;
    private cvs;
    private ctx;
    private prev_cvs;
    private prev_ctx;
    private mag_cvs;
    private mag_ctx;
    private scaleFactor;
    private edited_point;
    private edit_another_pt;
    private next_pt;
    private closestPointIndex;
    private mousePosTip;
    private editedNdTip;
    private scaleTip;
    private wrongsetTip;
    private _is_undistorted;
    set isDistortion(val: boolean);
    private gridShape;
    changeGridShape(): Promise<unknown>;
    private _is_show_gray;
    set isGrayScale(val: boolean);
    private _is_show_label;
    set isShowLabel(val: boolean);
    private _is_show_all_node;
    set isShowAllNode(val: boolean);
    private _is_show_magnifier;
    set isMagnifier(val: boolean);
    private nodes_list;
    get AllNodes(): number[][];
    private wrongsets_list;
    get AllWrongSets(): {
        key: string;
        count: number;
    }[];
    private showedImg;
    private renderImage;
    renderNode(corner: number): Promise<void>;
    private _render_node;
    private askToOpenUpdateFile;
    openNextWrongSet(wrong_set: string, mode?: string): Promise<boolean | undefined>;
    private renderNextMissing;
    private shouldUpdateFrame;
    private updateFrame;
    private distance;
    private mouseX;
    private mouseY;
    private screenX;
    private screenY;
    private isCtlKeyDown;
    private isShiftDown;
    private isAltDown;
    private stopPropagation;
    private cvsMouseWheelHandler;
    private cvsMouseMoveHandler;
    private cvsMouseUpHandler;
    private docKeydownHandler;
    private docKeyupHandler;
    private docKeypressHandler;
    private addEventHandler;
    private removeEventHandler;
    attachCanvas(container: HTMLDivElement): Promise<void>;
    resizeCanvas: (e?: UIEvent) => void;
    removeCanvas: () => void;
    private drawDot;
    render: () => void;
    get ScaleFactor(): number;
    scaleTo: (scale: number) => void;
    scrollToCenter: (x: number, y: number) => void;
    scrollToDot: () => void;
    isUpdate: boolean;
}
declare class modeLabel implements ModeFunction {
    Enable: boolean;
    ModeSelectorText: string;
    CenterCanvas: LabelCanvas;
    LeftToolbarTop: btnScale[];
    LeftToolbarBottom: btnScrollToPoint[];
    RightToolbarTop: (sidebarAllWrongSet | sidebarAllNodes)[];
    RightToolbarBottom: sidebarHelp[];
    MenuToolbarLeft: (btnSave | btnGridShape)[];
    MenuToolbarRight: (btnShowAllNode | btnShowLabel | btnMagnifier | btnDistort | btnGray | btnInfo)[];
    StartMode(): void;
    EndMode(): void;
}
export default modeLabel;
