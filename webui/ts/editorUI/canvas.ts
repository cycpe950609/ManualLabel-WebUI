export interface CanvasInterface {
    CanFinishDrawing: boolean;
    MouseDown?: (e: MouseEvent) => void;
    MouseMove?: (e: MouseEvent) => void;
    MouseUp?: (e: MouseEvent) => void;
    MouseOut?: (e: MouseEvent) => void;
    DrawFunction: (
        ctx: CanvasRenderingContext2D
    ) => void;
    CompositeOperation: GlobalCompositeOperation;
}

export class NoOPCVSFunc implements CanvasInterface {
    CanFinishDrawing: boolean = true;
    DrawFunction: (ctx: CanvasRenderingContext2D) => void = (ctx) => {};
    CompositeOperation: GlobalCompositeOperation = <GlobalCompositeOperation>"source-over";
};

export interface CanvasBase {
    name: string;
    attachCanvas: (container: HTMLDivElement) => void;
    setFunction: (func: CanvasInterface) => void;
    resizeCanvas: (e?: UIEvent) => void;
    removeCanvas: () => void;
    render: () => void;
    update?: (time: DOMHighResTimeStamp) => void; //Use in animateion
    isUpdate: boolean;
}

export class NoOPCanvas implements CanvasBase {
    update?: ((time: number) => void) | undefined;
    name = "NoOPCanvas";
    attachCanvas(container: HTMLDivElement) {
        // console.log("NoOPCanvas attachCanvas on ");
        // console.log(container);
    }
    setFunction(func: CanvasInterface){
        // console.log("setFunction",func);
    }
    resizeCanvas(e?: UIEvent) {
        // console.log("Resize Canvas Event");
    }
    removeCanvas() {
        // console.log("NoOPCanvas removeCanvas");
    }
    render() {
        // console.log("NoOPCanvas render");
    }
    isUpdate: boolean = false;
}
