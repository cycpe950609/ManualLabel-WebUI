import Dialog from "../editorUI/dialog";
import { BUTTON, DIV, SPAN } from "../editorUI/util/HTMLElement";

function askBeforeClose(current: string) {

    return new Promise((resolve, reject) => {
        let btnDiscard = BUTTON("mx-2rem w-full","Discard");
        btnDiscard.onclick = async () => {
            await window.backend.api.closeWrongSet();
            dia.close();
            resolve(true);
        }
        let btnSave = BUTTON("mx-2rem w-full","Save");
        btnSave.onclick = async () => {
            await window.backend.api.saveWrongSet();
            await window.backend.api.closeWrongSet();
            dia.close();
            resolve(true);
        }
        let btnCancel = BUTTON("mx-2rem w-full","Cancel");
        btnCancel.onclick = () => {
            dia.close();
            resolve(false);
        }
        let dia = new Dialog("Save or Discard ?",
            DIV("w-fit h-fit flex flex-col",[
                SPAN("w-fit",`WrongSet ${current} is not saved, Save or Discard ?`),
                DIV("w-full flex flex-row mt-8rem mb-0",[
                    btnDiscard,btnSave,btnCancel
                ])
            ]),
            (e) => {resolve(false);}
        );
        dia.show();
    });
}

export default askBeforeClose;