import FunctionInterface from "./interface/function";
import SidebarInterface from "./interface/sidebar";
declare class Sidebar implements FunctionInterface {
    Name: string;
    ImgName?: string;
    Tip?: string;
    private listName;
    private interfaceUUID;
    constructor(listName: string, uuid: string, sidebar: SidebarInterface);
    showSidebar(): void;
    hiddenSidebar(): void;
    toggleSidebar(): void;
    StartFunction(): boolean;
}
export default Sidebar;
export declare const bootstrap: () => Promise<void>;
export declare const mount: () => Promise<void>;
export declare const unmount: () => Promise<void>;
