import FunctionInterface from "../interface/function";
import { DIV, SPAN } from "./HTMLElement";

const createFunctionInterfaceButton = (
    func: FunctionInterface
) => {
    let tip = SPAN("tooltip-text","")
    const btn = DIV("toolbar-item",[
        tip
    ]);

    if (func.Tip !== undefined)
        btn.addEventListener(
            "mouseover",
            () =>{ 
                if(func.Tip === undefined) return;
                tip.innerText = typeof func.Tip === "string" ? func.Tip : func.Tip()            
            },
        );
    btn.addEventListener(
        "click",
        () => window.editorUI.Mode.changeFunction(func),
    );
    btn.style.backgroundImage =
        "url(img/" +
        (func.ImgName !== undefined ? func.ImgName : "color_selector") +
        ".png)";

    return btn;
}

export default createFunctionInterfaceButton;