import { CanvasBase, CanvasInterface } from "../editorUI/canvas";
import Dialog from "../editorUI/dialog";
import ModeFunction from "../editorUI/interface/mode";
import { BUTTON, DIV, LABEL, SPAN, TEXT } from "../editorUI/util/HTMLElement";
import Alert from "../editorUI/util/alert";
import Mode from "../mode";
import openDirectory from "../util/openDirectory";
import usageHTML from "./usage.md";

export type KeyData = string;

class WelcomeCanvas implements CanvasBase {
    isUpdate: boolean = false;
    setFunction: (func: CanvasInterface) => void = (func) => {};
    update?: ((time: number) => void) | undefined;
    name = "WelcomeCanvas";
    attachCanvas(container: HTMLDivElement) {
        // console.log(usageHTML);

        let title = (t: string) => {
            let lbl = LABEL("title");
            lbl.innerText = t;
            return lbl;
        };
        let linkBtn = (text: string, onClick: (e?: Event) => void) => {
            let lbl = LABEL("w-full h-full");
            const btn = document.createElement("input") as HTMLInputElement;
            btn.type = "button";
            btn.addEventListener("click", onClick, false);
            btn.style.display = "none";

            let content = DIV("linkButton", SPAN("btnText", text));
            lbl.appendChild(btn);
            lbl.appendChild(content);
            return lbl;
        };

        const openWorkingDirectory = async () => {
            let dirPath         = await openDirectory() as unknown as string;
            if(dirPath.length === 0) return;
            let state: {isOpenSuccess: boolean, errorInfo: string}   = await window.backend.api.openWorkspace(dirPath)
            if(state.isOpenSuccess){
                window.editorUI.Mode.enable("label");
                window.editorUI.Mode.changeTo("label");
            }
            else{
                Alert(state.errorInfo);
            }
        }

        container.appendChild(
            DIV(
                "welcome",
                DIV("CenterBox", [
                    DIV("Content", [
                        DIV("p-2 flex-col importBox", [
                            DIV("flex-col", [
                                title("Start"),
                                linkBtn("Open Working Directory", openWorkingDirectory)
                            ])
                        ]),
                        DIV("seperateLine"),
                        (() => {
                            let dv = DIV("p-2 helpBox");
                            dv.innerHTML = usageHTML;
                            return dv;
                        })()
                    ])
                ])
            )
        );
    }
    resizeCanvas = (e?: UIEvent) => {};
    removeCanvas = () => {};
    render = () => {};
}

class modeWelcome implements ModeFunction {
    Enable = true;

    CenterCanvas = new WelcomeCanvas();

    StartMode() {}
    EndMode() {}
}

export default modeWelcome;
