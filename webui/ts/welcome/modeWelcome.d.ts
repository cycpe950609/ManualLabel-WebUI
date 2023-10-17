import { CanvasBase, CanvasInterface } from "../editorUI/canvas";
import ModeFunction from "../editorUI/interface/mode";
export declare type KeyData = string;
declare class WelcomeCanvas implements CanvasBase {
    isUpdate: boolean;
    setFunction: (func: CanvasInterface) => void;
    update?: ((time: number) => void) | undefined;
    name: string;
    attachCanvas(container: HTMLDivElement): void;
    resizeCanvas: (e?: UIEvent) => void;
    removeCanvas: () => void;
    render: () => void;
}
declare class modeWelcome implements ModeFunction {
    Enable: boolean;
    CenterCanvas: WelcomeCanvas;
    StartMode(): void;
    EndMode(): void;
}
export default modeWelcome;
