import { CanvasBase } from "../canvas";

export enum PropertyType {
    String = "string",
    Integer = "integer",
    Float = "float",
    Color = "color",

    StringList = "stringlist",
    IntegerList = "integerlist",
    FloatList = "floatlist",
    ColorList = "colorlist",
}
export type PropertyItem = {
    ID: string; //ID store in global state
    Label: string; // Text show in PropertiesBox
    Type: PropertyType;
    Info: string; //TODO : add infos of specific Type
    Value: string | number | string[] | number[];
};

// How about if Tool Button clicked in StartFunction ?
//     Change = return true,
//     Remain = return false
export interface FunctionInterface {
    Name: string; // Tips of ToolButton
    ImgName?: string;
    Tip?: string | (() => string); // Tip showed on StatusBar
    HistoryName?: string; // Undefined if dont want to store in redo/undo hostory
    StartFunction: (cvs: CanvasBase) => boolean; // triggered when click ToolButton of this function
    EndFunction?: (cvs: CanvasBase) => void; // triggered when click ToolButton of OTHER function
}

export default FunctionInterface;

export class NoOPFunc implements FunctionInterface {
    constructor(idx: number) {
        // console.log(idx);
        this.Tip =
            "This is a example of using FunctionInterface " + idx.toString();
    }
    Name = "no_op";
    ImgName = "text";
    Tip = "";
    StartFunction(cvs: CanvasBase) {
        return false;
    }
    MouseDown = (e: UIEvent) => {
        // console.log("MouseDown event trigger");
    };
}
