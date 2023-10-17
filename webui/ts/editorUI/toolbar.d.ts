import FunctionInterface from "./interface/function";
export interface ToolbarInterface {
    hide: () => void;
    show: () => void;
    size: () => number;
    hasChildren: () => boolean;
}
export declare type createFuncType<ButtonInfoType> = (listName: string, name: string, arg0: ButtonInfoType) => FunctionInterface;
export declare class ToolbarPart<ButtonInfoType> {
    private name;
    constructor(name: string);
    clear(): void;
    addButtonList(funcList?: ButtonInfoType[]): string[];
    addButton(func: ButtonInfoType): string;
    removeButton(id: string): boolean;
    size(): number;
    hasChildren(): boolean;
}
declare class Toolbar<ButtonInfoType> {
    Top: ToolbarPart<ButtonInfoType>;
    Bottom: ToolbarPart<ButtonInfoType>;
    constructor(prefix: string, postfix: string, createFunc: createFuncType<ButtonInfoType>);
    removeButton(id: string): void;
    clear(): void;
    size(): number;
    hasChildren(): boolean;
}
export default Toolbar;
export declare type ToolbarPropsType = {
    type: string;
};
export declare const bootstrap: (props: ToolbarPropsType) => Promise<void>;
export declare const mount: (props: ToolbarPropsType) => Promise<void>;
export declare const unmount: (props: ToolbarPropsType) => Promise<void>;
