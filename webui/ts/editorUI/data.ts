import {
    CaseReducerActions,
    configureStore,
    createSlice,
    PayloadAction,
    Slice,
    SliceCaseReducers,
    Store} from "@reduxjs/toolkit";
import thunkMiddleware from "redux-thunk";
import logger from "redux-logger";
import FunctionInterface from "./interface/function";
import SidebarInterface from "./interface/sidebar";
import ModeFunction from "./interface/mode";

export type ModeInfo = {
    modeName: string, 
    enable: boolean, 
    def: ModeFunction,
}

let modeManagerSlice: Slice = createSlice({
    name: "modeManager",
    initialState: {
        root: "",
        action: "",
        data: {}
    },
    reducers: {
        rendered: (state,action) => {
            state.action = "";
        },
        enable: (state, action: PayloadAction<string>) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the Immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            let modeName = action.payload
            console.log("[EUI] Tried to enable " + modeName);
            let modeNameWithHash = `#/${modeName}`;
            if (modeNameWithHash in state.data) {
                console.log("[EUI] Enable " + modeName);
                const mode = state.data[modeNameWithHash];
                if (mode === undefined) throw new Error("MODEMGR_INTERNAL_ERROR");
                mode.enable = true;
                state.action = `mode.${modeName}.enable`;
            }
        },
        disable: (state, action: PayloadAction<string>) => {
            let modeName = action.payload
            let modeNameWithHash = `#/${modeName}`;
            if (modeNameWithHash in state.data) {
                const mode = state.data[modeNameWithHash];
                if (mode === undefined) throw new Error("MODEMGR_INTERNAL_ERROR");
                mode.enable = false;
                state.action = `mode.${modeName}.disable`;
            }
        },
        toggle: (state, action: PayloadAction<string>) => {
            let modeName = action.payload
            if (modeName in state) {
                const mode = state.data[modeName];
                if (mode === undefined) throw new Error("MODEMGR_INTERNAL_ERROR");
                if (mode.enable === true) data.dispatch(modeManagerSlice.actions.disable(modeName));
                else data.dispatch(modeManagerSlice.actions.enable(modeName));
            }
        },
        add: (state, action: PayloadAction<ModeInfo>) => {
            const name = `#/${action.payload.modeName}`;
            state.data[name] = action.payload;
            state.action = `mode.${action.payload.modeName}.added`;
        },
        remove: (state, action: PayloadAction<string>) => {
            let modeName = action.payload
            if(modeName === state.root) throw new Error("MODEMGR_ERROR: root can't be delete");
            if (modeName in state) {
                delete state.data[modeName]
                state.action = `mode.${modeName}.removed`;
            }
        },
        setRoot: (state, action: PayloadAction<string>) => {
            state.root = action.payload
        }
    }
});

export const { disable: modeDisable, enable: modeEnable, toggle: modeToggle, add: modeAdd, remove: modeRemove, setRoot: modeSetRoot } = modeManagerSlice.actions;

export type ToolbarStateType<ButtonInfoType> = {[key:string]:ButtonInfoType};
const createToolbarPartSlice = <ButtonInfoType>(name: string) => {
    return createSlice({
        name: name,
        initialState: {
            action: "",
            data: {} as any
        },
        reducers: {
            rendered: (state,action) => {
                state.action = "";
            },
            updateAll: (state, action: PayloadAction<ToolbarStateType<ButtonInfoType>>) => {
                // Redux Toolkit allows us to write "mutating" logic in reducers. It
                // doesn't actually mutate the state because it uses the Immer library,
                // which detects changes to a "draft state" and produces a brand new
                // immutable state based off those changes
                state.data = action.payload;
                state.action = `${name}.all.update`;
            },
            update: (state, action: PayloadAction<{id:string,new_func:ButtonInfoType}>) => {
                state.data[action.payload.id] = action.payload.new_func;
                state.action = `${name}.${action.payload.id}.update`;
            },
            add: (state, action: PayloadAction<{id:string,func:ButtonInfoType}>) => {
                state.data[action.payload.id] = action.payload.func;
                state.action = `${name}.${action.payload.id}.add`;
            },
            remove: (state, action: PayloadAction<string>) => {
                if(action.payload in state){
                    delete state.data[action.payload]
                    state.action = `${name}.${action.payload}.delete`;
                }
            },
            clear: (state, action: PayloadAction) => {
                return {
                    action: `${name}.clear`,
                    data: {}
                } // We need to return empty state so that redux will clear the state properly
            }
        },
    })
}

let menuLeftSlice: Slice = createToolbarPartSlice<FunctionInterface>("menubar_left");
let menuLeftPermSlice: Slice = createToolbarPartSlice<FunctionInterface>("menubar_left_perm");
let menuRightSlice: Slice = createToolbarPartSlice<FunctionInterface>("menubar_right");
let menuRightPermSlice: Slice = createToolbarPartSlice<FunctionInterface>("menubar_right_perm");

let toolTopSlice: Slice = createToolbarPartSlice<FunctionInterface>("toolbar_top");
let toolTopPermSlice: Slice = createToolbarPartSlice<FunctionInterface>("toolbar_top_perm");
let toolBottomSlice: Slice = createToolbarPartSlice<FunctionInterface>("toolbar_bottom");
let toolBottomPermSlice: Slice = createToolbarPartSlice<FunctionInterface>("toolbar_bottom_perm");

let sideTopSlice: Slice = createToolbarPartSlice<SidebarInterface>("sidebar_top");
let sideTopPermSlice: Slice = createToolbarPartSlice<SidebarInterface>("sidebar_top_perm");
let sideBottomSlice: Slice = createToolbarPartSlice<SidebarInterface>("sidebar_bottom");
let sideBottomPermSlice: Slice = createToolbarPartSlice<SidebarInterface>("sidebar_bottom_perm");


export type StatusTipInfo = {
    tip: string,
    showed: boolean,
}
export type StatusBarStateType = ToolbarStateType<StatusTipInfo>;
let statusLeftSlice: Slice = createToolbarPartSlice<StatusTipInfo>("statusbar_left");
let statusRightSlice: Slice = createToolbarPartSlice<StatusTipInfo>("statusbar_right");

export const editorUIActions = {
    mode: modeManagerSlice.actions,
    menubar_left_: menuLeftSlice.actions, // A _ after top is used to support 'perm' as POSTFIX for state list name
    menubar_left_perm: menuLeftPermSlice.actions,
    menubar_right_: menuRightSlice.actions,
    menubar_right_perm: menuRightPermSlice.actions,
    toolbar_top_: toolTopSlice.actions, // A _ after top is used to support 'perm' as POSTFIX for state list name
    toolbar_top_perm: toolTopPermSlice.actions,
    toolbar_bottom_: toolBottomSlice.actions,
    toolbar_bottom_perm: toolBottomPermSlice.actions,
    sidebar_top_: sideTopSlice.actions, // A _ after top is used to support 'perm' as POSTFIX for state list name
    sidebar_top_perm: sideTopPermSlice.actions,
    sidebar_bottom_: sideBottomSlice.actions,
    sidebar_bottom_perm: sideBottomPermSlice.actions,
    statusbar_left_: statusLeftSlice.actions,
    statusbar_right_: statusRightSlice.actions,
} as {[key:string]:CaseReducerActions<SliceCaseReducers<any>, string>}

export const data: Store = configureStore({
    reducer: {
        mode: modeManagerSlice.reducer,
        menubar_left_: menuLeftSlice.reducer,
        menubar_left_perm: menuLeftPermSlice.reducer,
        menubar_right_: menuRightSlice.reducer,
        menubar_right_perm: menuRightPermSlice.reducer,
        toolbar_top_: toolTopSlice.reducer,
        toolbar_top_perm: toolTopPermSlice.reducer,
        toolbar_bottom_: toolBottomSlice.reducer,
        toolbar_bottom_perm: toolBottomPermSlice.reducer,
        sidebar_top_: sideTopSlice.reducer,
        sidebar_top_perm: sideTopPermSlice.reducer,
        sidebar_bottom_: sideBottomSlice.reducer,
        sidebar_bottom_perm: sideBottomPermSlice.reducer,
        statusbar_left_: statusLeftSlice.reducer,
        statusbar_right_: statusRightSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
            .concat(thunkMiddleware)
            // .concat(logger)
});