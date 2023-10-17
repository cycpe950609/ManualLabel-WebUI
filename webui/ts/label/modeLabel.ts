import { CanvasBase, CanvasInterface } from "../editorUI/canvas";
import Dialog from "../editorUI/dialog";
import ModeFunction from "../editorUI/interface/mode";
import { BUTTON, CANVAS, DIV, LABEL, LI, SPAN, TABLE, TD, TEXT, TR } from "../editorUI/util/HTMLElement";
import { Grey2RGBA } from "../util/image";
import FunctionInterface from "../editorUI/interface/function";
import { manuallabel } from "../main";
import { meanBy, flatten, ceil } from "lodash";
import usageHTML from "./usage.md";
import SidebarInterface from "../editorUI/interface/sidebar";
import btnInfo from "../util/btnInfo";
import Alert from "../editorUI/util/alert";
import btnDistort from "./btnDistort";
import btnSave, { saveWrongSet } from "./btnSave";
import { TipComponent } from "../editorUI/statusbar";
import btnShowLabel from "./btnShowLabel";
import btnShowAllNode from "./btnShowAllNode";
import askBeforeClose from "../util/askBeforeClose";
import btnMagnifier from "./btnMagnifier";
import btnGray from "./btnGray";
import { VNode, h, toVNode } from "snabbdom";
import { HBUTTON, HTABLE, HTD, HTR } from "../editorUI/util/HHTMLElement";

class btnGridShape implements FunctionInterface {
    Name = "Grid Shape";
    ImgName: string = "gridshape";
    Tip = "Change Shape of Pattern";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StartFunction(cvs: CanvasBase) {
        (<LabelCanvas>cvs).changeGridShape();
        return false as boolean;
    }
}

class btnScale implements FunctionInterface {
    Name = "Change Scale";
    ImgName: string;
    Tip = () => `Scale to ${(this.scale((<LabelCanvas>window.editorUI.CenterCanvas).ScaleFactor)*100).toFixed(0)}%`;
    private scale: (lastScale: number) => number;

    constructor(image: string, scaleFunc: (lastScale: number) => number) {
        this.ImgName = image;
        this.scale = scaleFunc;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StartFunction(cvs: CanvasBase) {
        let next_scale = this.scale((<LabelCanvas>cvs).ScaleFactor);
        (<LabelCanvas>cvs).scaleTo(next_scale);
        return false as boolean;
    }
}

class btnScrollToPoint implements FunctionInterface {
    Name = "Find the point";
    ImgName: string = "findPt";
    Tip = "Scroll to labeling point";
    constructor() { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StartFunction(cvs: CanvasBase) {
        (<LabelCanvas>cvs).scrollToDot();
        return false as boolean;
    }
}

class sidebarHelp implements SidebarInterface {
    Name: string = "Help"; // Tips of ToolButton
    ImgName: string = "help";
    Tip = "Help";
    Visible: boolean = false;
    Title = () => "Help";
    Body = () => {
        let doc = DIV("w-full overflowY-scroll");
        doc.innerHTML = usageHTML;
        return toVNode(doc);
    };
}

class sidebarAllNodes implements SidebarInterface {

    constructor() {}
    Name: string = "AllNodes";
    ImgName: string = "nodes";
    Tip = "List All Points";

    Visible: boolean = false;


    Title = () => "All Nodes";
    Body = (cvs?: CanvasBase) => {
        if (this.Visible) {
            // let pointsList = (cvs as LabelCanvas).AllNodes;
            let pointsList = (window.editorUI.CenterCanvas as LabelCanvas).AllNodes;

            const createList = (classNames: string, idx: number, point: number[]) => {
                let btnEdit = HBUTTON("edit_btn mt-20px px-0", "Modify", (e: MouseEvent) => {
                    (window.editorUI.CenterCanvas as LabelCanvas).renderNode(idx);
                    // (cvs as LabelCanvas).renderNode(idx);
                });
            
                return HTR(classNames, [
                    HTD(`${idx}`.padStart(6)),
                    HTD(`${point[0].toFixed(3)}`.padStart(10)),
                    HTD(`${point[1].toFixed(3)}`.padStart(10)),
                    HTD(btnEdit)
                ])
            }
            let newTableBody = pointsList.map((point: number[], idx: number) => {
                if (point[0] < 0 || point[1] < 0) // not found point
                {
                    return createList("label-notfound", idx, point);
                }
                else if (point.length > 2) // Multiple potension points
                {
                    return createList("label-multiple", idx, point);
                }
                else {
                    return createList("label-success", idx, point);
                }
            })
            return HTABLE("w-full b-none align-right", [
                HTR("allnodes-header", [
                    HTD('Index'),
                    HTD('X coords'),
                    HTD('Y coords'),
                    HTD('Modify'),
                ])
            ],newTableBody);
        }
        return h("div");
    };
}

class sidebarAllWrongSet implements SidebarInterface {

    constructor() {}
    Name: string = "AllWrongSet";
    ImgName: string = "wrongset";
    Tip = "List All WrongSet";

    Visible: boolean = false;

    Title = () => "All WrongSet";
    Body = () => {
        if (this.Visible) {
            let wrongSetList = (window.editorUI.CenterCanvas as LabelCanvas).AllWrongSets;

            const createList = (classNames: string, wrongSetIdx: string, errCount: number) => {
                let btnEdit = HBUTTON("edit_btn mt-20px px-0", "Fix Error", (e: MouseEvent) => {
                    (window.editorUI.CenterCanvas as LabelCanvas).openNextWrongSet(wrongSetIdx);
                })
                return HTR(classNames, [
                    HTD(wrongSetIdx),
                    HTD(`${errCount}`.padStart(10)),
                    HTD(btnEdit)
                ])
            }
            let newTableBody = wrongSetList.map((info: {key: string, count: number}, idx: number) => {
                if (info.count > 100) // not found point
                {
                    return createList("label-notfound", info.key, info.count);
                }
                else if (info.count > 0) // Multiple potension points
                {
                    return createList("label-multiple", info.key, info.count);
                }
                else {
                    return createList("label-success", info.key, info.count);
                }
            })
            let rtvTB = HTABLE("w-full b-none align-right",
                HTR("allnodes-header", [
                    HTD('WrongSet'),
                    HTD('Wrong Points'),
                    HTD('Fix Error'),
                ])
            ,newTableBody)
            // console.log("[DEB] Create table : ",rtvTB)
            return rtvTB;
        }
        return h("div");
    };
}

export let opened_wrong_set: string = "";

export class LabelCanvas implements CanvasBase {
    setFunction: (func: CanvasInterface) => void = (func) => {};
    update?: ((time: number) => void) | undefined;

    name = "LabelCanvas";

    private wrong_image_shape: number[] = [0, 0];

    private scrollDiv: HTMLDivElement = DIV(
        "w-full h-full overflowX-scroll overflowY-scroll relative"
    );
    private infoDiv: HTMLDivElement = DIV("info-box");
    private cvs!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private prev_cvs!: HTMLCanvasElement;
    private prev_ctx!: CanvasRenderingContext2D;
    private mag_cvs!: HTMLCanvasElement;
    private mag_ctx!: CanvasRenderingContext2D;

    private scaleFactor: number = 1.0;

    private edited_point: {
        set: number;
        point: number;
        type: string;
        prevCorner: number[];
        nextCorner: number[];
        topCorner: number[];
        bottomCorner: number[];
        potential: number[][];
    } = {
            set: -1,
            point: -1,
            type: "init.no.point",
            prevCorner: [],
            nextCorner: [],
            topCorner: [],
            bottomCorner: [],
            potential: []
        };
    private edit_another_pt: boolean = false;
    private next_pt: number = -1;
    private closestPointIndex: number = -1;

    private mousePosTip!: TipComponent;
    private editedNdTip!: TipComponent;
    private scaleTip!: TipComponent;
    private wrongsetTip!: TipComponent;

    private _is_undistorted: boolean = true;

    public set isDistortion(val: boolean) {
        let render = async () => {
            await this.renderImage();
            this.render();
        };
        if(val !== this._is_undistorted){
            this._is_undistorted = val;
            render();
        }
    }

    private gridShape: number[] = [49,49];
    public changeGridShape() {
        return new Promise((resolve, reject) => {
            let txtWidth = TEXT("gridshape");
            txtWidth.type = "number";
            txtWidth.value = this.gridShape[0].toString();
            let txtHeight = TEXT("gridshape");
            txtHeight.type = "number";
            txtHeight.value = this.gridShape[1].toString();
            
            let btnOK = BUTTON("ok_btn mx-2rem","ok");
            btnOK.onclick = async () => {
                if(txtWidth.value.length === 0 || txtHeight.value.length === 0){ 
                    Alert("Please enter width/height of grid shape")
                    return;
                }
                if(parseInt(txtWidth.value) <= 0 || parseInt(txtHeight.value) <= 0){
                    Alert("Width/Height cant smaller than 1");
                    return;
                }
                this.gridShape[0] = parseInt(txtWidth.value)
                this.gridShape[1] = parseInt(txtHeight.value)
                await window.backend.api.updateGridShape(this.gridShape[0], this.gridShape[1]);
                dia.close();
                resolve(true);
            }

            let dia = new Dialog("Shape of Grid Point (ex: 49x49 for 50x50 patterns)",DIV("w-full flex flex-row",[
                txtWidth,
                LABEL("whitespace"," x "),
                txtHeight,
                btnOK
            ]));
            dia.show();
        });
    }

    private _is_show_gray: boolean = false;
    public set isGrayScale(val:boolean) {
        let render =async () => {
            this._is_show_gray = val;
            await this.renderImage();
            this.render();
        }

        if(this._is_show_gray !== val){
            render();
        }
    }

    private _is_show_label: boolean = false;
    public set isShowLabel(val:boolean) {
        if(this._is_show_label !== val){
            this._is_show_label = val;
            this.render();
        }
    }

    private _is_show_all_node: boolean = false;
    public set isShowAllNode(val: boolean) {
        if(this._is_show_all_node !== val)
        {
            this._is_show_all_node = val;
            this.render();
        }
    }

    private _is_show_magnifier: boolean = false;
    public set isMagnifier(val: boolean) {
        if(this._is_show_magnifier !== val){
            this._is_show_magnifier = val;
            this.mag_cvs.style.display = this._is_show_magnifier ? "initial" : "none";
            this.render();
        }
    }

    private nodes_list: number[][] = [];
    public get AllNodes() {
        return this.nodes_list;
    }

    private wrongsets_list: {key: string, count: number}[] = [];
    public get AllWrongSets() {
        return this.wrongsets_list;
    }

    private showedImg !: HTMLImageElement;
    private async renderImage() {
        this.wrong_image_shape = await window.backend.api.getImageShape();

        const fetchImage = async (url:string) => {
            const response = await fetch(url)
            const blob = await response.blob()
            return blob
        }

        const downloadImage = async (url:string) => {
            const imageBlob = await fetchImage(url)
            const imageBase64 = URL.createObjectURL(imageBlob)
            return imageBase64;
        }

        const getImageData = async (url:string) => {
            return new Promise(async (resolve, reject) => {
                let image = this.showedImg;
                image.onload = () => {
                    resolve(true);
                };
                image.src = await downloadImage(url);
            });
        }
        let mode = this._is_undistorted ? 'undistorted' : 'distorted';
        let color = this._is_show_gray ? 'gray' : 'color';
        await getImageData(`/image/${mode}/${color}`) as HTMLImageElement;
    }


    public async renderNode(corner: number) {
        this.edit_another_pt = true;
        await this._render_node(corner)
    }
    private async _render_node(corner: number) {
        if(corner < 0 || corner >= this.gridShape[0]*this.gridShape[1]) return;
        this.edited_point = await window.backend.api.getPointInfo(corner);
        this.editedNdTip.updateTip(`Editing node ${corner}`);
        switch (this.edited_point.type) {
            case "missing.topleft_corner":
            case "missing.center_corner": {
                this.infoDiv.innerHTML = `Missing No. ${this.edited_point.point} corner.</br>Point the missing corner with mouse then press 'x' </br> or press 'd' to delete the point`;
                break;
            }
            case "multiple.topleft_corner":
            case "multiple.center_corner": {
                this.infoDiv.innerHTML = `There are few potential corner of No. ${this.edited_point.point} corner.</br>Point the missing corner with mouse then press 'x'</br> or press 'c' to choose closest point automatically </br> or press 'd' to delete the point`
                break;
            }
            case "single.topleft_corner":
            case "single.center_corner": {
                this.infoDiv.innerHTML = `There are no error of No. ${this.edited_point.point} corner.</br>Point to new position with mouse then press 'x' to update`
                break;
            }
        }
        this.render();
        if(!this._is_show_all_node)
            this.scrollToDot();
    }
    private askToOpenUpdateFile(wrong_set:string) {
        return new Promise((resolve, reject) => {
            let btnOrigin = BUTTON("mx-2rem w-full",`Origin ${wrong_set}.csv`);
            btnOrigin.onclick = async () => {
                await this.openNextWrongSet(wrong_set,'origin');
                dia.close();
                resolve(true);
            }
            let btnUpdate = BUTTON("mx-2rem w-full",`Saved ${wrong_set}_update.csv`);
            btnUpdate.onclick = async () => {
                await this.openNextWrongSet(wrong_set,'update');
                dia.close();
                resolve(true);
            }
            let dia = new Dialog("Open Origin or Update ?",
                DIV("w-fit h-fit flex flex-col",[
                    SPAN("w-fit",`WrongSet ${wrong_set} had saved before, Open Origin or Update file ?`),
                    DIV("w-full flex flex-row mt-8rem mb-0",[
                        btnOrigin,btnUpdate
                    ])
                ]),
                (e) => {resolve(false);}
            );
            dia.show();
        });
    }
    public async openNextWrongSet(wrong_set: string,mode: string = 'check') {
        this.removeEventHandler();
        let response: { status: string } = await window.backend.api.openWrongSet(wrong_set,mode);
        if(response.status === "file.not.saved") {
            let isContinue = await askBeforeClose(opened_wrong_set);
            if(!isContinue) { 
                this.addEventHandler(); // For current opened wrongset
                return false;
            }
            response = await window.backend.api.openWrongSet(wrong_set,mode);
            if(response.status === "file.not.saved") throw new Error(`INTERNAL_ERROR: Cant open wrongset ${wrong_set}`);
        }
        if(response.status === "update.file.exist"){
            this.askToOpenUpdateFile(wrong_set);
            return;
        }
        this.nodes_list = await window.backend.api.getPointsList();
        let next_missing = await window.backend.api.getNextMissing();
        this.next_pt = next_missing.corner;
        this.closestPointIndex = -1;
        await this.renderImage();
        await this._render_node(this.next_pt)
        this.addEventHandler();
        opened_wrong_set = wrong_set;
        this.wrongsetTip.updateTip(`Editting WrongSet ${opened_wrong_set}`);
        return true;
    }

    private async renderNextMissing() {
        let next_missing = await window.backend.api.getNextMissing()
        this.closestPointIndex = -1;
        if(this.wrongsets_list.length === 0) {
            this.wrongsets_list = await window.backend.api.getWrongSet()
        }

        if (next_missing.type !== "end.next.missing") {
            if (next_missing.set !== opened_wrong_set) {
                if (next_missing.set == undefined || next_missing.corner == undefined) {
                    Alert("Internal Error occurred at 'renderNextMissing'");
                    return;
                }
                await window.backend.api.saveWrongSet();
                await window.backend.api.closeWrongSet();
                let success = await this.openNextWrongSet(next_missing.set);
            }
            else{
                this.next_pt = next_missing.corner;
            }
            await this._render_node(this.next_pt)
        } else {
            let dialog = new Dialog(
                "Finished",
                DIV("flex-col", [
                    SPAN("content", "No missing point need to be checked."),
                    SPAN("content", "You can close the webpage.")
                ])
            );
            this.ctx.clearRect(
                0,
                0,
                this.ctx.canvas.width,
                this.ctx.canvas.height
            );
            this.prev_ctx.clearRect(
                0,
                0,
                this.prev_ctx.canvas.width,
                this.prev_ctx.canvas.height
            );
            this.removeEventHandler();
            dialog.show();
        }
    }

    private shouldUpdateFrame: boolean = false;
    private updateFrame = () => {
        this.shouldUpdateFrame = true;
        requestAnimationFrame(this.updateFrame);
    };
    private distance = (p1x: number, p1y: number, p2x: number, p2y: number) => {
        let dx = p1x - p2x;
        let dy = p1y - p2y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    private mouseX: number = -1;
    private mouseY: number = -1;

    private screenX: number = -1;
    private screenY: number = -1;

    private isCtlKeyDown: boolean = false;
    private isShiftDown: boolean = false;
    private isAltDown: boolean = false;

    private stopPropagation(ev: Event) {
        ev.preventDefault();
        ev.stopPropagation();
    }

    private cvsMouseWheelHandler = (ev: WheelEvent) => {
        if (this.isCtlKeyDown) {
            this.stopPropagation(ev);
            if (ev.deltaY < 0)// ZOOM IN
            {
                this.scaleTo(this.scaleFactor + 0.1);
            }
            else if (ev.deltaY > 0) // zoom out 
            {
                this.scaleTo(this.scaleFactor - 0.1);

            }
            this.render()
            return;
        }
    }

    private cvsMouseMoveHandler = (ev: MouseEvent) => {
        let rect = this.cvs.getBoundingClientRect();
        this.mouseX = (ev.clientX - rect.left) / this.scaleFactor;
        this.mouseY = (ev.clientY - rect.top) / this.scaleFactor;

        this.screenX = ev.clientX;
        this.screenY = ev.clientY;

        this.mousePosTip.updateTip(
            "X : " + this.mouseX.toFixed(3) + " , Y : " + this.mouseY.toFixed(3)
        );

        if (this.shouldUpdateFrame) {
            this.shouldUpdateFrame = false;

            if(this._is_show_magnifier){
                let mag_w = this.mag_cvs.width / (this.scaleFactor*4);
                let mag_h = this.mag_cvs.height / (this.scaleFactor*4);
                this.mag_ctx.clearRect(0,0,this.mag_cvs.width,this.mag_cvs.height);
                let cropStartX = this.mouseX-mag_w/2;
                let cropStartY = this.mouseY-mag_h/2;
                let cropW = mag_w;
                let cropH = mag_h;
                let drawStartX = 0;
                let drawStartY = 0;
                let drawW = this.mag_cvs.width;
                let drawH = this.mag_cvs.height;
                // console.log("drawImg",cropStartX,cropStartY,cropW,cropH,drawStartX,drawStartY,drawW,drawH);
                this.mag_ctx.drawImage(this.showedImg,cropStartX,cropStartY,cropW,cropH,drawStartX,drawStartY,drawW,drawH);
                this.mag_ctx.beginPath();
                this.mag_ctx.moveTo(this.mag_cvs.width/2 - 25,this.mag_cvs.height/2);
                this.mag_ctx.lineTo(this.mag_cvs.width/2 - 5,this.mag_cvs.height/2);
                this.mag_ctx.moveTo(this.mag_cvs.width/2 + 25,this.mag_cvs.height/2);
                this.mag_ctx.lineTo(this.mag_cvs.width/2 + 5,this.mag_cvs.height/2);
                this.mag_ctx.moveTo(this.mag_cvs.width/2,this.mag_cvs.height/2 - 25);
                this.mag_ctx.lineTo(this.mag_cvs.width/2,this.mag_cvs.height/2 - 5);
                this.mag_ctx.moveTo(this.mag_cvs.width/2,this.mag_cvs.height/2 + 25);
                this.mag_ctx.lineTo(this.mag_cvs.width/2,this.mag_cvs.height/2 + 5);
                this.mag_ctx.strokeStyle = "red";
                this.mag_ctx.lineWidth = 4;
                this.mag_ctx.stroke();
            }

            switch (this.edited_point.type) {
                case "multiple.topleft_corner":
                case "multiple.center_corner": {
                    let distList: number[] = [];
                    this.edited_point.potential.map((pt: number[]) => {
                        distList.push(
                            this.distance(
                                pt[0],
                                pt[1],
                                this.mouseX,
                                this.mouseY
                            )
                        );
                    });

                    let minIndex = distList.indexOf(Math.min(...distList));
                    if (minIndex !== this.closestPointIndex) {
                        this.closestPointIndex = minIndex;
                        this.prev_ctx.clearRect(
                            0,
                            0,
                            this.prev_ctx.canvas.width,
                            this.prev_ctx.canvas.height
                        );
                        this.drawDot(
                            this.prev_ctx,
                            this.edited_point.potential[
                            this.closestPointIndex
                            ][0],
                            this.edited_point.potential[
                            this.closestPointIndex
                            ][1],
                            "orange",
                            3,"red",
                            ""
                        );
                    }

                    break;
                }
                case "single.topleft_corner":
                case "single.center_corner":{
                    this.closestPointIndex = 0;
                    break;
                }
                default:{
                    this.closestPointIndex = -1
                    break;
                }
            }
        }
    };

    private cvsMouseUpHandler = (ev: PointerEvent) =>{ 
        if(this._is_show_all_node){
            let x = ev.offsetX / this.scaleFactor;
            let y = ev.offsetY / this.scaleFactor;

            let distList: number[] = this.nodes_list.map((pt: number[]) => {
                return this.distance(
                    pt[0],
                    pt[1],
                    x,
                    y
                )
            });

            let minIndex = distList.indexOf(Math.min(...distList));
            console.log(`[DEB] Closest point is ${minIndex}`);
            this.renderNode(minIndex);
        }
    }

    private docKeydownHandler = (ev: KeyboardEvent) => {
        // ev.preventDefault();
        // ev.stopPropagation();
        console.log(`[EUI] keydown: ${ev.key}`)
        if (ev.key === "Control")   { this.stopPropagation(ev); this.isCtlKeyDown = true;   }
        if (ev.key === "Shift")     { this.stopPropagation(ev); this.isShiftDown = true;    }
        if (ev.key === "Alt")       { this.stopPropagation(ev); this.isAltDown = true;   };
        if (ev.key === "+" && this.isCtlKeyDown && !this.isShiftDown) { this.stopPropagation(ev); this.scaleTo(this.scaleFactor+0.1) };
        if (ev.key === "-" && this.isCtlKeyDown && !this.isShiftDown) { this.stopPropagation(ev); this.scaleTo(this.scaleFactor-0.1) };
        if (ev.key === "0" && this.isCtlKeyDown && !this.isShiftDown) { this.stopPropagation(ev); this.scaleTo(1) };
        if (ev.key === "s" && this.isCtlKeyDown && !this.isShiftDown) { this.stopPropagation(ev); saveWrongSet(); };

        if (ev.key === "ArrowLeft"  && !this.isCtlKeyDown && !this.isShiftDown && !this.isAltDown) { this.stopPropagation(ev); this._render_node(this.edited_point.point - 1)}
        if (ev.key === "ArrowDown"  && !this.isCtlKeyDown && !this.isShiftDown && !this.isAltDown) { this.stopPropagation(ev); this._render_node(this.edited_point.point + this.gridShape[1])}
        if (ev.key === "ArrowUp"    && !this.isCtlKeyDown && !this.isShiftDown && !this.isAltDown) { this.stopPropagation(ev); this._render_node(this.edited_point.point - this.gridShape[1])}
        if (ev.key === "ArrowRight" && !this.isCtlKeyDown && !this.isShiftDown && !this.isAltDown) { this.stopPropagation(ev); this._render_node(this.edited_point.point + 1)}

        if (ev.key === "a"  && !this.isCtlKeyDown && !this.isShiftDown && this.isAltDown) { this.stopPropagation(ev); this._render_node(this.edited_point.point - 1)}
        if (ev.key === "s"  && !this.isCtlKeyDown && !this.isShiftDown && this.isAltDown) { this.stopPropagation(ev); this._render_node(this.edited_point.point + this.gridShape[1])}
        if (ev.key === "w"  && !this.isCtlKeyDown && !this.isShiftDown && this.isAltDown) { this.stopPropagation(ev); this._render_node(this.edited_point.point - this.gridShape[1])}
        if (ev.key === "d"  && !this.isCtlKeyDown && !this.isShiftDown && this.isAltDown) { this.stopPropagation(ev); this._render_node(this.edited_point.point + 1)}
    
        // For used in macos keyboard
        if (ev.key === "å"  && !this.isCtlKeyDown && !this.isShiftDown && this.isAltDown) { this.stopPropagation(ev); this._render_node(this.edited_point.point - 1)}
        if (ev.key === "ß"  && !this.isCtlKeyDown && !this.isShiftDown && this.isAltDown) { this.stopPropagation(ev); this._render_node(this.edited_point.point + this.gridShape[1])}
        if (ev.key === "∑"  && !this.isCtlKeyDown && !this.isShiftDown && this.isAltDown) { this.stopPropagation(ev); this._render_node(this.edited_point.point - this.gridShape[1])}
        if (ev.key === "∂"  && !this.isCtlKeyDown && !this.isShiftDown && this.isAltDown) { this.stopPropagation(ev); this._render_node(this.edited_point.point + 1)}
    
    }
    private docKeyupHandler = (ev: KeyboardEvent) => {
        // event should never be prevented, so that we wont get event from keypress
        // ev.preventDefault();
        // ev.stopPropagation();
        if (ev.key === "Control")   { this.stopPropagation(ev); this.isCtlKeyDown = false;  };
        if (ev.key === "Shift")     { this.stopPropagation(ev); this.isShiftDown = false;   };
        if (ev.key === "Alt")       { this.stopPropagation(ev); this.isAltDown = false;   };
    }

    private docKeypressHandler = async (ev: KeyboardEvent) => {
        // console.log(`[DEB] Keypress ${ev.key}`);
        // ev.preventDefault();
        // ev.stopPropagation();
        if (ev.key === "x") {
            this.stopPropagation(ev);
            let data = {
                x: -1,
                y: -1
            };
            data.x = this.mouseX;
            data.y = this.mouseY;
            if (this.edited_point.type !== "end.next.missing") {
                this.removeEventHandler();
                this.nodes_list[this.edited_point.point] = [data['x'],data['y']];
                this.isUpdate = true;
                let response: { status: string } = await window.backend.api.updatePoint(
                    this.edited_point.point,
                    data
                );
                this.addEventHandler();

                if (response.status !== "success") {
                    throw new Error("Unknowned Status");
                } else {
                    if (this.edit_another_pt == true) {
                        this.edit_another_pt = false;
                        this._render_node(this.next_pt);
                    }
                    else {
                        this.renderNextMissing();
                    }
                }
            }
        }
        if (ev.key === "c") {
            this.stopPropagation(ev);
            let data = {
                x: -1,
                y: -1
            };
            switch (this.edited_point.type) {
                case "multiple.topleft_corner":
                case "multiple.center_corner": {
                    data.x =
                        this.edited_point.potential[this.closestPointIndex][0];
                    data.y =
                        this.edited_point.potential[this.closestPointIndex][1];
                    break;
                }
            }
            if (this.edited_point.type !== "end.next.missing") {
                this.removeEventHandler();
                this.nodes_list[this.edited_point.point] = [data['x'],data['y']];
                this.isUpdate = true;
                let response: { status: string } = await window.backend.api.updatePoint(
                    this.edited_point.point,
                    data
                );
                this.addEventHandler();

                if (response.status !== "success") {
                    throw new Error("Unknowned Status");
                } else {
                    if (this.edit_another_pt == true) {
                        this.edit_another_pt = false;
                        this._render_node(this.next_pt);
                    }
                    else {
                        this.renderNextMissing();
                    }
                }
            }
        }
        if (ev.key === "d") {
            // Delete the current editting node
            this.stopPropagation(ev);
            // console.log(`[DEB] Delete node ${this.edited_point.point}`)
            let data = {
                x: -1,
                y: -1
            };
            if (this.edited_point.type !== "end.next.missing") {
                this.removeEventHandler();
                this.nodes_list[this.edited_point.point] = [data['x'],data['y']];
                this.isUpdate = true;
                let response: { status: string } = await window.backend.api.updatePoint(
                    this.edited_point.point,
                    data
                );
                this.addEventHandler();

                if (response.status !== "success") {
                    throw new Error("Unknowned Status");
                } else {
                    if (this.edit_another_pt == true) {
                        this.edit_another_pt = false;
                        this._render_node(this.next_pt);
                    }
                    else {
                        this.renderNextMissing();
                    }
                }
            }
        }
        if (ev.key === "s") { this.stopPropagation(ev); this.scrollToDot(); };
        if (ev.key === "1") { this.stopPropagation(ev); this.scaleTo(1.0);  };
        if (ev.key === "2") { this.stopPropagation(ev); this.scaleTo(2.0);  };
        if (ev.key === "3") { this.stopPropagation(ev); this.scaleTo(3.0);  };
        if (ev.key === "4") { this.stopPropagation(ev); this.scaleTo(4.0);  };
        if (ev.key === "q") { this.stopPropagation(ev); this.scaleTo(this.scaleFactor - 0.1);   };
        if (ev.key === "z") { this.stopPropagation(ev); this.scaleTo(this.scaleFactor + 0.1);   };

    };
    private addEventHandler = () => {
        this.cvs.addEventListener("mousemove", this.cvsMouseMoveHandler);
        // this.scrollDiv.addEventListener("wheel", this.cvsMouseWheelHandler);
        document.addEventListener("keypress", this.docKeypressHandler);
        document.addEventListener("keydown", this.docKeydownHandler);
        document.addEventListener("keyup", this.docKeyupHandler);
        window.addEventListener("wheel", this.cvsMouseWheelHandler, {
            passive: false
        });
        this.cvs.addEventListener("pointerup", this.cvsMouseUpHandler)
    };
    private removeEventHandler = () => {
        this.cvs.removeEventListener("mousemove", this.cvsMouseMoveHandler);
        // this.scrollDiv.removeEventListener("wheel", this.cvsMouseWheelHandler);
        document.removeEventListener("keypress", this.docKeypressHandler);
        document.removeEventListener("keydown", this.docKeydownHandler);
        document.removeEventListener("keyup", this.docKeyupHandler);
        window.removeEventListener("wheel", this.cvsMouseWheelHandler);
    };
    async attachCanvas(container: HTMLDivElement) {

        this.mousePosTip =window.editorUI.Statusbar.addTip('X: 0, Y: 0');
        this.editedNdTip =window.editorUI.Statusbar.addTip('Select one node to edit');
        this.scaleTip    =window.editorUI.Statusbar.addTip('Scale : 100%')
        this.wrongsetTip =window.editorUI.Statusbar.addTip('Editting WrongSet 0',true);

        this.cvs = CANVAS("absolute cursor-cross");
        this.ctx = this.cvs.getContext("2d") as CanvasRenderingContext2D;

        this.prev_cvs = CANVAS("absolute disable-mouse");
        this.prev_ctx = this.prev_cvs.getContext(
            "2d"
        ) as CanvasRenderingContext2D;

        this.mag_cvs = CANVAS("disable-mouse magifier");
        this.mag_cvs.width = 150;
        this.mag_cvs.height = 150;
        this.mag_cvs.style.display = this._is_show_magnifier ? "initial" : "none";
        this.mag_ctx = this.mag_cvs.getContext("2d") as CanvasRenderingContext2D;
        this.mag_ctx.clearRect(0, 0, this.mag_cvs.width, this.mag_cvs.width);

        this.showedImg = document.createElement("img");
        this.showedImg.classList.add("absolute");
        this.showedImg.classList.add("disable-mouse");

        this.scrollDiv.appendChild(this.showedImg);
        this.scrollDiv.appendChild(this.cvs);
        this.scrollDiv.appendChild(this.prev_cvs);
        container.appendChild(this.scrollDiv);
        container.appendChild(this.infoDiv);
        container.appendChild(this.mag_cvs);
        
        await this.changeGridShape();

        this.renderNextMissing();

        requestAnimationFrame(this.updateFrame);
    }
    resizeCanvas = (e?: UIEvent) => { };
    removeCanvas = () => { };

    private drawDot = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        color: string,
        borderWidth: number = 2,
        borderStyle: string = "black",
        text: string = "",
    ) => {
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderStyle;
        ctx.beginPath();
        let paintX = x * this.scaleFactor;
        let paintY = y * this.scaleFactor;
        ctx.arc(
            paintX,
            paintY,
            3+borderWidth, //radius
            0,
            2 * Math.PI
        );
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        
        if(text !== "" && this._is_show_label) {
            ctx.font = "20px monospace";
            ctx.textAlign = "left"
            ctx.fillText(text, paintX + 10, paintY);
            ctx.strokeStyle = color;
            ctx.strokeText(text, paintX + 10, paintY);
        }
    };
    render = () => {
        console.log(`[DEB] Point Type is ${this.edited_point.type}`);

        let img_shape = this.wrong_image_shape;

        this.showedImg.width = img_shape[1] * this.scaleFactor;
        this.showedImg.height = img_shape[0] * this.scaleFactor;

        this.ctx.canvas.width = img_shape[1] * this.scaleFactor;
        this.ctx.canvas.height = img_shape[0] * this.scaleFactor;

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.save();
        this.ctx.scale(1, 1);

        if(this._is_show_all_node){
            let len = this.nodes_list.length;
            this.nodes_list.forEach((point: number[],index: number)=>{
                let rainbowColor = `hsl( ${360/len*index},80%,50%)`;
                if (!(point[0] < 0 || point[1] < 0)) // not found point
                {
                    this.drawDot(
                        this.ctx,
                        point[0],
                        point[1],
                        rainbowColor,
                        2,rainbowColor,
                        `${index}`
                    );
                }
            })
        }
        if (
            this.edited_point.type === "missing.center_corner" ||
            this.edited_point.type === "multiple.center_corner" ||
            this.edited_point.type === "single.center_corner"
        )
            this.drawDot(
                this.ctx,
                this.edited_point.prevCorner[0],
                this.edited_point.prevCorner[1],
                "red",
                2,"black",
                `${this.edited_point.point - 1}`
            );

        if (this.edited_point.type === "multiple.center_corner")
            this.edited_point.potential.forEach((pt: number[]) => {
                this.drawDot(this.ctx, pt[0], pt[1], "yellow",2,"black","");
            });

        if (
            this.edited_point.nextCorner[0] != -1 &&
            this.edited_point.nextCorner[1] != -1
        )
            this.drawDot(
                this.ctx,
                this.edited_point.nextCorner[0],
                this.edited_point.nextCorner[1],
                "blue",
                2,"black",
                `${this.edited_point.point + 1}`
            );

        if (
            this.edited_point.topCorner[0] != -1 &&
            this.edited_point.topCorner[1] != -1
        )
            this.drawDot(
                this.ctx,
                this.edited_point.topCorner[0],
                this.edited_point.topCorner[1],
                "magenta",
                2,"black",
                `${this.edited_point.point - this.gridShape[0]}`
            );
        if (
            this.edited_point.bottomCorner[0] != -1 &&
            this.edited_point.bottomCorner[1] != -1
        )
            this.drawDot(
                this.ctx,
                this.edited_point.bottomCorner[0],
                this.edited_point.bottomCorner[1],
                "cyan",
                2,"black",
                `${this.edited_point.point + this.gridShape[0]}`
            );

        this.ctx.restore();

        this.prev_ctx.canvas.width = img_shape[1] * this.scaleFactor;
        this.prev_ctx.canvas.height = img_shape[0] * this.scaleFactor;
        this.prev_ctx.scale(1,1);
        let ev = new MouseEvent("mousemove", { clientX: this.screenX, clientY: this.screenY });
        this.cvsMouseMoveHandler(ev);// Update closest point
        // change size and scale canvas remove content, need to redraw if closestPointIndex not change
        if (this.closestPointIndex !== -1) {
            this.prev_ctx.clearRect(
                0,
                0,
                this.prev_ctx.canvas.width,
                this.prev_ctx.canvas.height
            );
            this.prev_ctx.save();
            this.drawDot(
                this.prev_ctx,
                this.edited_point.potential[
                this.closestPointIndex
                ][0],
                this.edited_point.potential[
                this.closestPointIndex
                ][1],
                "orange",
                3,"red",
                ""
            );
        }
        this.prev_ctx.restore();
    };
    get ScaleFactor() { return this.scaleFactor };
    scaleTo = (scale: number) => {
        let new_scale = scale
        if(new_scale >= 4) new_scale = 4;
        if(new_scale <= 0.1) new_scale = 0.1;
        this.scaleFactor = new_scale;
        this.scaleTip.updateTip(
            "Scale : " + (this.scaleFactor * 100).toFixed(0) + "%"
        );
        this.render();
    };
    scrollToCenter = (x: number, y: number) => {
        let width = this.scrollDiv.clientWidth;
        let height = this.scrollDiv.clientHeight;
        this.scrollDiv.scrollTo(
            x * this.scaleFactor - width / 2,
            y * this.scaleFactor - height / 2
        );
    };
    scrollToDot = () => {
        console.log("[DEB] Point Type is ", this.edited_point.type);
        switch (this.edited_point.type) {
            case "missing.topleft_corner": 
            case "single.topleft_corner": {
                if (
                    this.edited_point.nextCorner[0] != -1 &&
                    this.edited_point.nextCorner[1] != -1
                )
                    this.scrollToCenter(
                        this.edited_point.nextCorner[0],
                        this.edited_point.nextCorner[1]
                    );
                break;
            }
            case "missing.center_corner":
            case "single.center_corner": {
                if(this.edited_point.topCorner[0] != -1 && this.edited_point.topCorner[1] != -1)
                {
                    this.scrollToCenter(
                        this.edited_point.topCorner[0],
                        this.edited_point.topCorner[1]
                    );
                    break;
                }
                if(this.edited_point.bottomCorner[0] != -1 && this.edited_point.bottomCorner[1] != -1)
                {
                    this.scrollToCenter(
                        this.edited_point.bottomCorner[0],
                        this.edited_point.bottomCorner[1]
                    );
                    break;
                }
                if(this.edited_point.nextCorner[0] != -1 && this.edited_point.nextCorner[1] != -1)
                {
                    this.scrollToCenter(
                        this.edited_point.nextCorner[0],
                        this.edited_point.nextCorner[1]
                    );
                    break;
                }
                this.scrollToCenter(
                    this.edited_point.prevCorner[0],
                    this.edited_point.prevCorner[1]
                );
                break;
            }
            case "multiple.topleft_corner": {
                if (
                    this.edited_point.nextCorner[0] != -1 &&
                    this.edited_point.nextCorner[1] != -1
                )
                    this.scrollToCenter(
                        this.edited_point.nextCorner[0],
                        this.edited_point.nextCorner[1]
                    );
                break;
            }
            case "multiple.center_corner": {
                let avgCenter = [
                    meanBy(
                        this.edited_point.potential,
                        (pt: number[]) => pt[0]
                    ),
                    meanBy(this.edited_point.potential, (pt: number[]) => pt[1])
                ];
                this.scrollToCenter(avgCenter[0], avgCenter[1]);
                break;
            }
        }
    };
    public isUpdate = false;
}

class modeLabel implements ModeFunction {
    Enable = false;
    ModeSelectorText = "Label";

    CenterCanvas = new LabelCanvas();

    LeftToolbarTop = [
        new btnScale("scaleDown", (lastScale: number) =>
            lastScale - 0.1 > 0.1 ? lastScale - 0.1 : 0.1
        ),
        new btnScale("scale1", (lastScale: number) => 1.0),
        new btnScale("scale2", (lastScale: number) => 2.0),
        new btnScale("scale3", (lastScale: number) => 3.0),
        new btnScale("scale4", (lastScale: number) => 4.0),
        new btnScale("scaleUp", (lastScale: number) =>
            lastScale + 0.1 < 4.0 ? lastScale + 0.1 : 4.0
        )
    ];

    LeftToolbarBottom = [new btnScrollToPoint()];

    RightToolbarTop = [new sidebarAllWrongSet(), new sidebarAllNodes()];

    RightToolbarBottom = [new sidebarHelp()];

    MenuToolbarLeft = [new btnSave(), new btnGridShape()];

    MenuToolbarRight = [new btnShowAllNode(),new btnShowLabel(), new btnMagnifier(), new btnDistort(),new btnGray(), new btnInfo()];

    StartMode() { }
    EndMode() { }
}

export default modeLabel;
