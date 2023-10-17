import { CanvasBase } from "./editorUI/canvas";
import Dialog from "./editorUI/dialog";
import EditorUI from "./editorUI/EditorUI";
import FunctionInterface from "./editorUI/interface/function";
export let manuallabel: EditorUI;

import addID2Object from "./ObjectID";
import modeLabel from "./label/modeLabel";
import btnInfo from "./util/btnInfo";
import modeWelcome from "./welcome/modeWelcome";
import Alert from "./editorUI/util/alert";
import axios from 'axios';

addID2Object();

declare global {
    interface Window { 
        backend: {
            api: any
        };
        editorUI: EditorUI; 
        manuallabel: any;
    }
}


document.addEventListener("DOMContentLoaded", async () => {

    window.backend = {api:{}};
    window.backend.api.initBackend                 = () => axios.get('/initial').then((val) => val.data),
    window.backend.api.getWrongSet                 = () => axios.get('/wrongset').then((val) => val.data),
    window.backend.api.getErrorList                = (image_id: number) => axios.get(`/errorlist/${image_id}`).then((val) => val.data),
    window.backend.api.getCurrentWorkingDirectory  = () => axios.get('/cwd').then((val) => val.data),
    window.backend.api.getCurrentWorkingWrongSet   = () => axios.get('/cwwrongset').then((val) => val.data),
    window.backend.api.openWrongSet                = (wrong_set: string,mode:string) => axios.get(`/open_wrongset/${wrong_set}/${mode}`).then((val) => val.data),
    window.backend.api.saveWrongSet                = () => axios.get('/save_wrongset').then((val) => val.data),
    window.backend.api.closeWrongSet               = () => axios.get('/close_wrongset').then((val) => val.data),
    window.backend.api.getPointsList               = () => axios.get('/pointslist').then((val) => val.data),
    window.backend.api.getPointInfo                = (wrong_corner: number) => axios.get(`/pointinfo/${wrong_corner}`).then((val) => val.data),
    window.backend.api.getImageShape               = () => axios.get('/imageshape').then((val) => val.data),
    window.backend.api.getImage                    = (isUndistort: string, isGrayScale: string) => axios.get(`/image/${isUndistort}/${isGrayScale}`).then((val) => val.data),
    window.backend.api.getCropImage                = (x: number,y: number,w: number,h: number,isUndistort = false) => axios.get(`/cropimage/${x}/${y}/${w}/${h}/${isUndistort}`).then((val) => val.data);
    window.backend.api.getNextMissing              = () => axios.get('/next_missing').then((val) => val.data),
    window.backend.api.updatePoint                 = (point_id:number,new_data:{x: number;y: number;}) => axios.patch(`update_point/${point_id}`,new_data).then((val) => val.data),
    window.backend.api.openWorkspace               = (path:string) => axios.patch('/open_workspace/',path).then((val) => val.data),
    
    window.backend.api.updateGridShape             = (width: number,height: number) => axios.get(`/update_gridshape/${width}/${height}`).then((val) => val.data),

    window.backend.api.listDirectory                = (path:string) => axios.patch('/open_directory_dialog/list',path).then((val) => val.data),
    window.backend.api.isDirectoryExist             = (path:string) => axios.patch('/open_directory_dialog/isexist',path).then((val) => val.data),
    window.backend.api.getLink                      = () => axios.get('/open_directory_dialog/link').then((val) => val.data),

    window.manuallabel = {
        alert: Alert
    }

    await window.backend.api.initBackend();
    window.editorUI = new EditorUI();
    window.editorUI.Mode.add("welcome", new modeWelcome());
    window.editorUI.Mode.add("label", new modeLabel());
    window.editorUI.Mount("editorUI_container");
    window.editorUI.Mode.changeTo("welcome");

});