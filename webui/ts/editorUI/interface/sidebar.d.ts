import { VNode } from "snabbdom";
export default interface SidebarInterface {
    Name: string;
    ImgName?: string;
    Tip?: string;
    HistoryName?: string;
    Visible: boolean;
    Title: () => string;
    Body: () => VNode;
}
export declare class NoOPSidebar implements SidebarInterface {
    constructor(visible?: boolean, showText?: string);
    private showedText;
    Name: string;
    ImgName: string;
    Tip: string;
    Visible: boolean;
    Title: () => string;
    Body: () => VNode;
}
