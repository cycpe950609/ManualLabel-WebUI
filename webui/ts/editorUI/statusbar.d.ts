export declare class TipComponent {
    private idx;
    private side;
    constructor(defaultTip: string, side: string, idx: number);
    updateTip(tip: string): void;
    hide(): void;
    show(): void;
}
declare class StatusBar {
    constructor();
    private defaultTip;
    private __createTipComponent__;
    addTip(defaultTip: string, atRight?: boolean): TipComponent;
    clear(): void;
}
export default StatusBar;
export declare type StatusbarPropsType = {
    side: string;
};
export declare const bootstrap: (props: StatusbarPropsType) => Promise<void>;
export declare const mount: (props: StatusbarPropsType) => Promise<void>;
export declare const unmount: (props: StatusbarPropsType) => Promise<void>;
