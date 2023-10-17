import { data } from "./data";
import { DIV, SPAN } from "./util/HTMLElement";
import Alert from "./util/alert";
import * as singleSpa from 'single-spa';

export const bootstrap = async () => {}
export const mount = async () => {
    let cnt = document.getElementById("canvas_group");
    if(cnt === null) throw new Error("INTERAL_ERROR: Container of CenterCanvas is not found");
    let errorText = DIV("flex flex-col",[
        SPAN("horiz-center","Oops! Something went wrong."),
        SPAN("horiz-center","Jump to HomePage in 1 second.")
    ]) 
    errorText.style.height = "100%";
    errorText.style.position = "relative";
    errorText.style.top = "50%";

    let cvs = DIV("w-full h-full",
        errorText
    );
    cvs.style.backgroundColor = "white";
    cvs.style.color = "red";
    cnt.appendChild(cvs);
    setTimeout(() => {
        singleSpa.navigateToUrl(data.getState().mode.root)
    },1000);
}
export const unmount = async () => {
    let cnt = document.getElementById("canvas_group");
    if(cnt === null) throw new Error("INTERAL_ERROR: Container of CenterCanvas is not found");
    cnt.innerHTML = "";
};