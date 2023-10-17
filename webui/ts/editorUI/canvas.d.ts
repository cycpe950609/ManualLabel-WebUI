export interface CanvasInterface {
    CanFinishDrawing: boolean;
    MouseDown?: (e: MouseEvent) => void;
    MouseMove?: (e: MouseEvent) => void;
    MouseUp?: (e: MouseEvent) => void;
    MouseOut?: (e: MouseEvent) => void;
    DrawFunction: (ctx: CanvasRenderingContext2D) => void;
    CompositeOperation: GlobalCompositeOperation;
}
export declare class NoOPCVSFunc implements CanvasInterface {
    CanFinishDrawing: boolean;
    DrawFunction: (ctx: CanvasRenderingContext2D) => void;
    CompositeOperation: GlobalCompositeOperation;
}
export interface CanvasBase {
    name: string;
    attachCanvas: (container: HTMLDivElement) => void;
    setFunction: (func: CanvasInterface) => void;
    resizeCanvas: (e?: UIEvent) => void;
    removeCanvas: () => void;
    render: () => void;
    update?: (time: DOMHighResTimeStamp) => void;
    isUpdate: boolean;
}
export declare class NoOPCanvas implements CanvasBase {
    update?: ((time: number) => void) | undefined;
    name: string;
    attachCanvas(container: HTMLDivElement): void;
    setFunction(func: CanvasInterface): void;
    resizeCanvas(e?: UIEvent): void;
    removeCanvas(): void;
    render(): void;
    isUpdate: boolean;
}
