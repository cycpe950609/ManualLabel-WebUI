import EditorUI from "./editorUI/EditorUI";
export declare let manuallabel: EditorUI;
declare global {
    interface Window {
        backend: {
            api: any;
        };
        editorUI: EditorUI;
        manuallabel: any;
    }
}
