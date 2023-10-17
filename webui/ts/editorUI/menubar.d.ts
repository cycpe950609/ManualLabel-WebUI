import EditorUI from "./EditorUI";
import FunctionInterface from "./interface/function";
import { ToolbarInterface, ToolbarPart } from "./toolbar";
export declare class Menubar {
    Left: ToolbarPart<FunctionInterface>;
    Right: ToolbarPart<FunctionInterface>;
    private editorUI;
    private container;
    private leftCNT;
    private rightCNT;
    constructor(parent: () => EditorUI, cnt: ToolbarInterface, topContainer: HTMLDivElement, bottomContainer: HTMLDivElement, createButtonFunc: (info: FunctionInterface) => HTMLElement);
    removeButton(id: string): void;
    clear(): void;
    hide(): void;
    show(): void;
    size(): number;
    hasChildren(): boolean;
}
export declare class MenubarManager {
    MenuLeftCNT: HTMLDivElement;
    MenuRightCNT: HTMLDivElement;
    private MenubarPermLeftCNT;
    private MenubarModeLeftCNT;
    private MenubarModeRightCNT;
    private MenubarPermRightCNT;
    modeMenubar: Menubar;
    permMenubar: Menubar;
    private editorUI;
    private fakeCNT;
    private chkIfShowed;
    constructor(parent: () => EditorUI, createButtonFunc: (info: FunctionInterface) => HTMLDivElement);
    private createToolBar;
}
