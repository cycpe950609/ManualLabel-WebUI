import Dialog from "../dialog"
import { BUTTON, DIV, LABEL, SPAN } from "./HTMLElement"

const Alert = (msg: string) => {
    
    let errLabel = LABEL("alert-danger",`${msg}`)

    let okBtn = BUTTON("ok_btn mt-20px","OK")
    okBtn.addEventListener('click',(e)=>{
        e.preventDefault();
        
        alertDia.close();
        return;
    })

    let alertDia = new Dialog("Alert",DIV("w-fit-content flex flex-col align-end",[
        errLabel,
        okBtn
    ]))
    alertDia.show()
}

export default Alert