import Dialog from "../editorUI/dialog";
import { HBUTTON, HDIV, HIMG, HSPAN, HTABLE, HTD, HTR } from "../editorUI/util/HHTMLElement";
import { BUTTON, DIV, LABEL } from "../editorUI/util/HTMLElement";

import {
    init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    h,
    toVNode,
    VNode,
} from "snabbdom";

const patchDialog = init([
    // Init patch function with chosen modules
    classModule, // makes it easy to toggle classes
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
    eventListenersModule, // attaches event listeners
]);

const openDirectory = () => {
    
    return new Promise(async (resolve, reject) => {
        let cwd = await window.backend.api.getCurrentWorkingDirectory() as string; 

        let showTxt = cwd.length > 70 ? "..." + cwd.slice(-66) : cwd;

        let lblPath = LABEL("w-full", `Path : ${showTxt}`);
        let btnOpen = BUTTON("ok_btn", "Open");
        btnOpen.addEventListener("click", () => {
            dia.close();
            resolve(cwd);
        })

        let LinkList    = DIV("w-fit h-fit");
        let cntLinkList = DIV("overflowY-scroll open_dir_dialog_linklist", LinkList);
        let lastLinkListVNode = toVNode(LinkList);

        let FileList    = DIV("w-fit h-fit");
        let cntFileList = DIV("overflowY-scroll open_dir_dialog_filelist",FileList);
        let lastFileListVNode = toVNode(FileList);


        let enterDirectory = async (dirname : string) => {
            if(dirname.length == 0) return;
            let newCWD = dirname[0] == '/' ? dirname : cwd + '/' + dirname;
            let isexist = await window.backend.api.isDirectoryExist(newCWD);
            if(!isexist) return

            switch (dirname) {
                case ".": { break; }
                case "..":{ 
                    let splitPath = cwd.split('/')
                    cwd = splitPath.length > 1 ? cwd.split('/').slice(0, -1).join('/') : "/"; 
                    break; 
                }
                default: { cwd = newCWD; break; }
            }
            let dirnameList = await window.backend.api.listDirectory(cwd) as string[];
            let newFileList = renderList('Directory Name',dirnameList,dirnameList);
            patchDialog(lastFileListVNode,newFileList)
            lastFileListVNode = newFileList;

            let linkList    = await window.backend.api.getLink() as {'name': string, 'url': string}[];
            let linkNameList = linkList.map(link => link.name);
            let linkPathList = linkList.map(link => link.url);
            let newLinkList = renderList('Link Name',linkNameList,linkPathList);
            patchDialog(lastLinkListVNode,newLinkList)
            lastLinkListVNode = newLinkList;

            let showTxt = cwd.length > 70 ? "..." + cwd.slice(-66) : cwd;
            lblPath.innerText = `Path : ${showTxt}`
        }

        const renderList = (title: string, nameList: string[],dirnameList: string[]) => {
            let newTableBody = dirnameList.map((dirname: string, idx: number) => {
                return HTR("filelist", [
                    HTD(
                        HBUTTON(
                            "edit_btn", 
                            HDIV("w-full justify-left",[
                                HIMG("h-full mr-5px","img/diricon.png"),
                                HSPAN("w-fit",nameList[idx]),
                            ]),
                            (e: MouseEvent) => {
                                enterDirectory(dirname);
                            }
                        )
                    )
                ])
            })
            let rtvTB = HTABLE("w-full h-fit b-none",
                HTR("allnodes-header", [
                    HTD(title)
                ])
            ,newTableBody)
            // console.log("[DEB] Create table : ",rtvTB)
            return rtvTB;
        }



        let dia = new Dialog("Open Directory",DIV("open_dir_dialog flex flex-col",[
            DIV("flex flex-row open_dir_dialog_file_manager",[
                cntLinkList,
                cntFileList,
            ]),
            DIV("flex flex-row open_dir_dialog_toolbar",[
                lblPath,
                btnOpen
            ]),
        ]))

        enterDirectory('.')
        dia.show();
    });
}

export default openDirectory;
