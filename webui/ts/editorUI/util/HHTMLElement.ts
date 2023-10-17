import { VNode, h } from "snabbdom";

export const HDIV = (
    className: string,
    children?: VNode | VNode[] | string
) => {
    const dv = document.createElement("div");
    let ids = "div#divcnt";
    className.split(' ').map((clsNme : string) => ids += `.${clsNme}`)
    if (children === undefined) return h(ids);
    return h(ids, children);
};

export const HTABLE = (
    className: string,
    thead?: VNode | VNode[],
    tbody?: VNode | VNode[]
):VNode => {
    let ids = "table#tbcnt";
    className.split(' ').map((clsNme : string) => ids += `.${clsNme}`)
    let children : VNode[] = [];
    if(thead !== undefined) children = children.concat(thead);
    if(tbody !== undefined) children = children.concat(tbody);
    return h(ids, children);
};

export const HTR = (
    className: string,
    children?: VNode | VNode[]
) => {
    let ids = "tr#trcnt";
    if(className.split(' ').length > 0)
        className.split(' ').map((clsNme : string) => ids += `.${clsNme}`)
    if (children === undefined) return h(ids);
    return h(ids, children);
}

export const HTD = (
    children?: VNode | VNode[] | string
) => {
    const td = document.createElement("td");
    if (children === undefined) return h("td");
    return h("td", children);
};

export const HLABEL = (
    className: string,
    children?: VNode | VNode[] | string
) => {
    let ids = "label#lblcnt";
    className.split(' ').map((clsNme : string) => ids += `.${clsNme}`)
    if (children === undefined) return h(ids);
    return h(ids, children);
};

export const HSPAN = (className: string, children: string) => {
    let ids = "span#spcnt";
    className.split(' ').map((clsNme : string) => ids += `.${clsNme}`)
    return h(ids, children);
};

export const HCANVAS = (className: string) => {
    let ids = "canvas#cvscnt";
    className.split(' ').map((clsNme : string) => ids += `.${clsNme}`)
    return h(ids);
};

export const HTEXT = (
    className: string,
    required: boolean = true
) => {
    let ids = "input#txtcnt";
    className.split(' ').map((clsNme : string) => ids += `.${clsNme}`)
    return h(ids, {props: {required: required}})
}

export const HBUTTON = (
    className: string,
    children: VNode | VNode[] | string,
    clickHandler: any
) => {
    let ids = "div#txtcnt.button";
    className.split(' ').map((clsNme : string) => ids += `.${clsNme}`)
    return h(ids,
        {
            props: {
                // type: "button",
                // value: children
            },
            on: {click: clickHandler},
        },children);
}

export const HLI = (text: string) => {
    return h("li", text);
}

export const HIMG = (className: string, src: string) => {
    let ids = "img";
    className.split(' ').map((clsNme : string) => ids += `.${clsNme}`)
    return h(ids, {props: {src: src}});
}