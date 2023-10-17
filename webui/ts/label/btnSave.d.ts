import FunctionInterface from "../editorUI/interface/function";
declare class btnSave implements FunctionInterface {
    Name: string;
    ImgName: string;
    Tip: string;
    constructor();
    StartFunction(): boolean;
}
export declare const saveWrongSet: () => Promise<void>;
export default btnSave;
