import { FunctionInterface } from "./FunctionInterface";
declare class Toolbar {
    private DIV;
    private SPAN;
    private inc_id;
    private buttonTop;
    private buttonBottom;
    private container;
    private toolbar;
    constructor(container: string);
    private createToolButton;
    addToolButtonListAtTop(funcList?: FunctionInterface[]): number[];
    addToolButtonListAtBottom(funcList?: FunctionInterface[]): number[];
    addToolButtonAtTop(func: FunctionInterface): number;
    addToolButtonAtBottom(func: FunctionInterface): number;
    removeToolButton(id: number): void;
    clear(): void;
    clearTop(): void;
    clearBottom(): void;
}
export default Toolbar;
