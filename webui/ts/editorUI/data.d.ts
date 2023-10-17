import { CaseReducerActions, SliceCaseReducers, Store } from "@reduxjs/toolkit";
import ModeFunction from "./interface/mode";
export declare type ModeInfo = {
    modeName: string;
    enable: boolean;
    def: ModeFunction;
};
export declare const modeDisable: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`>, modeEnable: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`>, modeToggle: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`>, modeAdd: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`>, modeRemove: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`>, modeSetRoot: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`>;
export declare type ToolbarStateType<ButtonInfoType> = {
    [key: string]: ButtonInfoType;
};
export declare type StatusTipInfo = {
    tip: string;
    showed: boolean;
};
export declare type StatusBarStateType = ToolbarStateType<StatusTipInfo>;
export declare const editorUIActions: {
    [key: string]: CaseReducerActions<SliceCaseReducers<any>, string>;
};
export declare const data: Store;
