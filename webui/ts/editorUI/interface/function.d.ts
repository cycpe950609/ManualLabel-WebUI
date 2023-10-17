import { CanvasBase } from "../canvas";
export declare enum PropertyType {
    String = "string",
    Integer = "integer",
    Float = "float",
    Color = "color",
    StringList = "stringlist",
    IntegerList = "integerlist",
    FloatList = "floatlist",
    ColorList = "colorlist"
}
export declare type PropertyItem = {
    ID: string;
    Label: string;
    Type: PropertyType;
    Info: string;
    Value: string | number | string[] | number[];
};
export interface FunctionInterface {
    Name: string;
    ImgName?: string;
    Tip?: string | (() => string);
    HistoryName?: string;
    StartFunction: (cvs: CanvasBase) => boolean;
    EndFunction?: (cvs: CanvasBase) => void;
}
export default FunctionInterface;
export declare class NoOPFunc implements FunctionInterface {
    constructor(idx: number);
    Name: string;
    ImgName: string;
    Tip: string;
    StartFunction(cvs: CanvasBase): boolean;
    MouseDown: (e: UIEvent) => void;
}
