import { CanvasBase } from "../editorUI/canvas";
import Dialog from "../editorUI/dialog";
import FunctionInterface from "../editorUI/interface/function";
import { DIV, SPAN } from "../editorUI/util/HTMLElement";

class btnInfo implements FunctionInterface {
    Name = "Info";
    ImgName = "info"
    Tip = "Info";

    constructor() {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StartFunction(cvs: CanvasBase) {
        let getCWD = async () => {
            let cwd = await window.backend.api.getCurrentWorkingDirectory();
            let content = DIV("flex-col", [
                SPAN("title", "Currunt Working Directory : "),
                SPAN("content", cwd)
            ]);
            let infoDia = new Dialog("Infomation", content);
            infoDia.show();
        }
        getCWD();
        return false as boolean;
    }
}

export default btnInfo;
