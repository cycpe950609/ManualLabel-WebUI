from flask import Flask, Response, send_from_directory, request,make_response
import os
import socket
import json
import pandas as pd
import numpy as np
import sys
import cv2
import glob
import argparse
import webbrowser
from threading import Timer
from natsort import natsorted

parser = argparse.ArgumentParser()
parser.add_argument('-b', '--browser', action='store_true', help='Set it to open default web browser')
parser.add_argument('-c', '--calib', action='store_true', help='Set it for calibration')
parser.add_argument('-p', '--port', type=int, help='Port to listen on, default is chosen randomly')
args = parser.parse_args()
CALIB = args.calib
class API:
    def __init__(self) -> None:
        print("API is initialized")
        self.currentWorkingWrongSet = -1
        self.loaded = False
        self.modified = False
        self.data = pd.DataFrame()
        self.image = np.zeros((1,1))
        self.undistort_image = np.zeros((1,1))
        self.cam_int = np.array([])
        self.cam_dist = np.array([])
        self.cam_reproj_error = -1
        
        self.currentErrorPoint = -1 # Before openWrongSet, we will call getNextMission one time which add 1 to currentErrorPoint
        self.gridWidth = 32
        self.gridHeight = 32
        
        self.PATTERN_IMAGE_PATH = os.path.join('data','projector','patterns')
        if CALIB:
            self.BOARD_IMAGE_PATH = os.path.join('data', 'projector', 'boards')
        self.LABEL_CSV_DIR_PATH = os.path.join('label')
        self.LOGFILE_PATH = os.path.join('cache', 'log.json')
        self.CAM_PARAMS_FILE_PATH = os.path.join('cache', 'cam_params.json')
        
    def getWrongSet(self):
        rtv = []
        for key in self.log.keys():
            rtv.append({
                "key": key,
                "count":len(self.log[key])
            })
        return rtv

    def updateGridShape(self,width,height):
        self.gridWidth = width
        self.gridHeight = height
        print(f"updateGridShape : {self.gridWidth}x{self.gridHeight}")
        return True

    def getErrorList(self,image_id):
        return json.dumps(list(self.log[image_id]))

    def getCurrentWorkingDirectory(self):
        return os.getcwd()
    
    def getCurrentWorkingWrongSet(self):
        return self.currentWorkingWrongSet
    
    def __check_image_format(self):
        for fmt in ["bmp","png","jpeg","jpg","pgm"]:
            if(len(glob.glob(os.path.join(self.PATTERN_IMAGE_PATH,f'*.{fmt}'))) > 0):
                return fmt
        raise Exception("No image found")
    
    def openWrongSet(self,wrong_set,mode): # Load the image/csv
        print(f"Open {wrong_set} : {self.loaded}, {mode}")
        if(not self.loaded or (self.loaded and not self.modified)):
            if(os.path.isfile(os.path.join(self.LABEL_CSV_DIR_PATH,str(wrong_set) + '_update.csv')) and mode == 'check'):
                return {'status': 'update.file.exist'}
            if(os.path.isfile(os.path.join(self.LABEL_CSV_DIR_PATH,str(wrong_set) + '_update.csv')) and mode == 'update'):
                csvname = os.path.join(self.LABEL_CSV_DIR_PATH,str(wrong_set) + '_update.csv')
            else:
                csvname = os.path.join(self.LABEL_CSV_DIR_PATH,str(wrong_set) + '.csv')
            
            IMG_FMT = self.__check_image_format()
            print(f"Image format is {IMG_FMT}")
            self.data = pd.read_csv(csvname)
            self.image = cv2.imread(os.path.join(self.PATTERN_IMAGE_PATH, str(wrong_set) + f'.{IMG_FMT}'))
            self.image = cv2.cvtColor(self.image,cv2.COLOR_BGR2RGBA)
            # self.image = cv2.flip(self.image, 1)
            if CALIB:
                self.board = cv2.imread(os.path.join(self.BOARD_IMAGE_PATH, str(wrong_set) + f'.{IMG_FMT}'))
                self.board = cv2.cvtColor(self.board, cv2.COLOR_BGR2GRAY)
                # self.board = cv2.flip(self.board, 1)
                
            h, w = self.image.shape[:2]
            # newcameramtx, roi = cv2.getOptimalNewCameraMatrix(self.cam_int, self.cam_dist, (w,h), 0, (w,h))
            self.undistort_image = cv2.undistort(self.image,self.cam_int,self.cam_dist,None,self.cam_int)
            self.undistort_board = cv2.undistort(self.board,self.cam_int,self.cam_dist,None,self.cam_int)
            
            self.loaded = True
            self.modified = False
            self.currentWorkingWrongSet = wrong_set
            self.currentErrorPoint = -1
            return {'status': 'open.file.success'}

        else:
            return {'status': 'file.not.saved'}


    def saveWrongSet(self):
        if(self.loaded):
            csv_name = os.path.join(self.LABEL_CSV_DIR_PATH, str(self.currentWorkingWrongSet) + '_update.csv')
            self.data.rename(columns={'Unnamed: 0': ''}, inplace=True)
            self.data.to_csv(csv_name, index=False)
            self.modified = False
            print(f'Data {self.currentWorkingWrongSet} Finished: Save to {csv_name}')
    
    def closeWrongSet(self):
        self.loaded = False
        self.currentWorkingWrongSet = -1
        self.currentErrorPoint = -1
        self.data = pd.DataFrame()
        self.image = np.zeros((1,1))
        self.undistort_image = np.zeros((1,1))
        
    def getPointsList(self): # Return all points of current image
        if(self.loaded):
            
            rtv = []
            for wrong_corner in range(self.data.iloc[len(self.data.index) - 1, 0]+1):
                if(int((self.data.count(axis=1)[wrong_corner] - 1)) >= 2):
                    rtv.append([
                        int(self.data.iloc[wrong_corner, 2]),
                        int(self.data.iloc[wrong_corner, 1])
                    ])
                else:
                    rtv.append([-1,-1])
            print("getPointsList",rtv)
            return rtv
        return []

    def getPointInfo(self,wrong_corner): # Return 4 neightbors of pointIdx
        yieldData = {
            "set": self.currentWorkingWrongSet,
            "point": wrong_corner,
            "type": "wrong.corner.index",
            "prevCorner": [-1, -1],
            "nextCorner": [-1, -1],
            "topCorner": [-1, -1],
            "bottomCorner": [-1, -1],
            "potential": []
        }
        
        if(wrong_corner < 0 or wrong_corner >= self.gridHeight*self.gridWidth):
            return yieldData

        # Initial title before keyboard event
        # Type 1 of missing label (Cannot find potential corner at all)
        if wrong_corner > 0:
            if  not (   pd.isna(self.data.iloc[wrong_corner - 1, 1]) or pd.isna(self.data.iloc[wrong_corner - 1, 2]) or\
                        self.data.iloc[wrong_corner - 1, 1] < 0 or self.data.iloc[wrong_corner - 1, 2] < 0              ):
                yieldData["prevCorner"] = [
                    int(self.data.iloc[wrong_corner - 1, 2]), 
                    int(self.data.iloc[wrong_corner - 1, 1])
                    ]
        print("Rows : {}".format(len(self.data.index)))
        if wrong_corner < self.data.iloc[len(self.data.index) - 1, 0]:  # Get last index
            if  not (   pd.isna(self.data.iloc[wrong_corner + 1, 1]) or pd.isna(self.data.iloc[wrong_corner + 1, 2]) or\
                        self.data.iloc[wrong_corner + 1, 1] < 0 or self.data.iloc[wrong_corner + 1, 2] < 0              ):
                yieldData["nextCorner"] = [
                    int(self.data.iloc[wrong_corner + 1, 2]), 
                    int(self.data.iloc[wrong_corner + 1, 1])
                    ]
                
        if(wrong_corner - self.gridWidth >= 0):
            if not (pd.isna(self.data.iloc[wrong_corner - self.gridWidth, 1]) or pd.isna(self.data.iloc[wrong_corner - self.gridWidth, 2]) or\
                    self.data.iloc[wrong_corner - self.gridWidth, 1] < 0 or self.data.iloc[wrong_corner - self.gridWidth, 2] < 0            ):
                yieldData["topCorner"] = [
                    int(self.data.iloc[wrong_corner - self.gridWidth, 2]), 
                    int(self.data.iloc[wrong_corner - self.gridWidth, 1])
                ]
        if wrong_corner + self.gridWidth < self.data.iloc[len(self.data.index) - 1, 0]:  # Get last index
            if not (pd.isna(self.data.iloc[wrong_corner + self.gridWidth, 1]) or pd.isna(self.data.iloc[wrong_corner + self.gridWidth, 2]) or\
                    self.data.iloc[wrong_corner + self.gridWidth, 1] < 0 or self.data.iloc[wrong_corner + self.gridWidth, 2] < 0            ):
                yieldData["bottomCorner"] = [
                    int(self.data.iloc[wrong_corner + self.gridWidth, 2]), 
                    int(self.data.iloc[wrong_corner + self.gridWidth, 1])
                ]

        if  pd.isna(self.data.iloc[wrong_corner, 1]) or pd.isna(self.data.iloc[wrong_corner, 2]) or\
            self.data.iloc[wrong_corner, 1] < 0 or self.data.iloc[wrong_corner, 2] < 0:
            if wrong_corner == 0:
                yieldData["type"] = "missing.topleft_corner"
            else:
                yieldData["type"] = "missing.center_corner"
        elif    int((self.data.count(axis=1)[wrong_corner] - 1) / 2) == 1 and\
                self.data.iloc[wrong_corner, 1] > 0 and self.data.iloc[wrong_corner, 2] > 0: # Only have one candidate
            yieldData["potential"].append([
                int(self.data.iloc[wrong_corner,2]),
                int(self.data.iloc[wrong_corner,1])
            ])
            if wrong_corner == 0:
                yieldData["type"] = "single.topleft_corner"
            else:
                yieldData["type"] = "single.center_corner"        
        else:  # Type 2 of missing label (Find multiple potential corners)
            # num, x_val, y_val = '      n:', 'x pixel:', 'y pixel:'
            for i in range(int((self.data.count(axis=1)[wrong_corner] - 1) / 2)):
                yieldData["potential"].append([
                    int(self.data.iloc[wrong_corner, 2 * i + 2]),
                    int(self.data.iloc[wrong_corner, 2 * i + 1])
                ])
            if wrong_corner == 0:
                yieldData["type"] = "multiple.topleft_corner"
            else:
                yieldData["type"] = "multiple.center_corner"
        
        return yieldData
    
    def __load__camera_params__(self, json_file):
        with open(json_file, 'r') as f:
            param_data = json.load(f)
            cam_int = param_data['camera']['K']
            cam_dist = param_data['camera']['cam_dist']
            cam_reproj_error = param_data['camera']['cam_reproj_error']
            return np.array(cam_int), np.array(cam_dist), cam_reproj_error
    
    def getImageShape(self):
        return list(self.image.shape)
    
    def __gray_scale__(self,image):
        tmp_img = cv2.cvtColor(image, cv2.COLOR_RGBA2GRAY)
        return cv2.cvtColor(tmp_img, cv2.COLOR_GRAY2RGBA)
    def getImage(self,isUndistort = False, isGrayScale = False):# Return image
        
        if(isUndistort):
            img = self.__gray_scale__(self.undistort_image) if isGrayScale else self.undistort_image
        else:
            img = self.__gray_scale__(self.image) if isGrayScale else self.image
        
        if CALIB:
            if(isUndistort):
                board = self.undistort_board
            else:
                board = self.board

            ret, corners = cv2.findChessboardCorners(board, (8, 11), None)
            if ret == True:
                corners = cv2.cornerSubPix(board, corners, (11, 11), (-1, -1), (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001))
                corners = np.squeeze(corners, axis=None)
                for corner in corners:
                    img = cv2.circle(img, (round(corner[0]), round(corner[1])), 8, (255, 0, 255, 255), 2)
            else:
                raise Exception(f'Can\'t find corners from {self.currentWorkingWrongSet}')
        return img
    
    def getCropImage(self,x: int,y: int,w: int,h: int,isUndistort = False):
        if(isUndistort):
            img = self.undistort_image
        else:
            img = self.image

        img_h, img_w = self.image.shape[:2]        
        
        startX = max(0,x)
        startY = max(0,y)
        endX = min(img_w,x + w)
        endY = min(img_h,y + h)
        
        cropImg = np.zeros((w,h,4))
        cropImg.fill(125)
        
        if(endX < 0 or endY < 0):
            return cropImg.tolist()
        elif(startX > img_w or startY > img_h):
            return cropImg.tolist()
        
        crop_w = endX - startX
        crop_h = endY - startY


        rtvStartX   = 0 if startX > 0 else w - crop_w
        rtvStartY   = 0 if startY > 0 else h - crop_h
        rtvEndX     = w if endX < img_w else crop_w
        rtvEndY     = h if endY < img_h else crop_h

        print(startX,startY,endX,endY,rtvStartX,rtvStartY,rtvEndX,rtvEndY)
        
        cropImg[rtvStartY:rtvEndY,rtvStartX:rtvEndX] = img[startY:endY,startX:endX]
        print(cropImg.shape)
        # cv2.imwrite(f'{x}-{y}-{w}-{h}.png',cropImg)

        return cropImg.tolist()
    
    def __next_missing__(self): # TODO : return next missing index of current working wrong set only
        for wrong_set, wrong_corners in self.log.items():
            for wrong_corner in wrong_corners:
                rtv = {
                    "type" : "next.missing",
                    "set": int(wrong_set),
                    "corner": int(wrong_corner)
                }
                yield rtv
                
    def getNextMissing(self):
        totalErrorPts = len(self.log[self.currentWorkingWrongSet])
        totalWrongSet = len(self.log.keys())
        print(f"getNextMissing {self.currentWorkingWrongSet} {totalWrongSet} {self.currentErrorPoint} {totalErrorPts}")
        if(self.currentErrorPoint + 1 >= totalErrorPts): # 
            key_list = list(self.log.keys())
            curSetIdx = key_list.index(self.currentWorkingWrongSet)
            if(curSetIdx + 1 == totalWrongSet):
                print("No next missing wrongset")
                rtv = {
                    "type": "end.next.missing"
                }
            else:
                print("Next wrongset")
                new_set = key_list[key_list.index(self.currentWorkingWrongSet) + 1]
                rtv = {
                        "type" : "next.missing",
                        "set": new_set,
                        "corner": self.log[new_set][0]
                    }
                self.currentWorkingWrongSet = new_set
                
        else:
            print("Same wrongset")
            current_set = self.currentWorkingWrongSet
            rtv = {
                "type" : "next.missing",
                "set": current_set,
                "corner": self.log[current_set][self.currentErrorPoint+1]
            }
            self.currentErrorPoint += 1
        return rtv

    def updatePoint(self,point_id,new_data):
        print("Point : {} with new data {}".format(point_id,new_data))
        request_params = json.loads(new_data)
        self.data.iloc[int(point_id), 1] = request_params['y']
        self.data.iloc[int(point_id), 2] = request_params['x']
        self.data.iloc[int(point_id), 3:20] = pd.NA
        self.modified = True
        return {"status": "success"} # json.dumps({"status": "success"})
        
    def openWorkspace(self,directory):
        dirname = directory

        if(not os.path.isfile(os.path.join(dirname,self.LOGFILE_PATH))):
            # self.window.evaluate_js("window.manuallabel.alert('Log file not exist')")
            return { "isOpenSuccess" : False, "errorInfo": "Log file not exist"}
        
        if(not os.path.isfile(os.path.join(dirname,self.CAM_PARAMS_FILE_PATH))):
            # self.window.evaluate_js("window.manuallabel.alert('cam_params.json file not exist')")
            return { "isOpenSuccess" : False, "errorInfo": "cam_params.json file not exist"}
        
        if(not os.path.isdir(os.path.join(dirname,self.LABEL_CSV_DIR_PATH))):
            # self.window.evaluate_js("window.manuallabel.alert('\"label\" directory not exist')")
            return { "isOpenSuccess" : False, "errorInfo": "\"label\" directory not exist'"}
        
        if(not os.path.isdir(os.path.join(dirname,self.PATTERN_IMAGE_PATH))):
            # self.window.evaluate_js("window.manuallabel.alert('Image directory not exist')")
            return { "isOpenSuccess" : False, "errorInfo": "Image directory not exist"}
        
        os.chdir(dirname)
        print(f'Change cwd to : {os.getcwd()}')
        with open(self.LOGFILE_PATH) as f:
            self.log = json.load(f)
            self.gen = self.__next_missing__()
            print(self.log.keys())
            self.currentWorkingWrongSet = list(self.log.keys())[0]
            self.currentErrorPoint = -1
        
        self.cam_int, self.cam_dist, self.cam_reproj_error = self.__load__camera_params__(os.path.join(dirname,self.CAM_PARAMS_FILE_PATH))
            
        return { "isOpenSuccess" : True, "errorInfo": ""}
    
app = Flask(__name__)
api = API()

@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r
# Serve files
@app.route("/")
def home():
    print("Get home file")
    root_dir = os.path.dirname(os.path.realpath(os.path.dirname(__file__)))
    # print(root_dir)
    return send_from_directory(os.path.join(root_dir, "public"), "index.html")
def sendFile(dir, filename):
    root_dir = os.path.dirname(os.path.realpath(os.path.dirname(__file__)))
    return send_from_directory(os.path.join(root_dir, "public", dir), filename)
@app.route("/public/<path:filename>")  # For usage.md's image
def getPUBLIC(filename):
    return sendFile("", filename)
@app.route("/favicon.ico")
def getFaviconICO():
    return sendFile("", "favicon.ico")
@app.route("/css/<path:filename>")
def getCSS(filename):
    return sendFile("css", filename)
@app.route("/js/<path:filename>")
def getJS(filename):
    return sendFile("js", filename)
@app.route("/img/<path:filename>")
def getIMG(filename):
    return sendFile("img", filename)

# js_api
@app.route("/initial")
def initialBackend():
    global api
    api = API()
    return json.dumps(True)
    
@app.route("/wrongset")
def getWrongSet():
    return json.dumps(api.getWrongSet())

@app.route("/errorlist/<image_id>")
def getErrorList(image_id):
    return json.dumps(api.getErrorList(int(image_id)))

@app.route("/cwd")
def getCurrentWorkingDirectory():
    return json.dumps(api.getCurrentWorkingDirectory())


@app.route("/cwwrongset")
def getCurrentWorkingWrongSet():
    return json.dumps(api.getCurrentWorkingWrongSet())


@app.route("/open_wrongset/<wrong_set>/<mode>")
def openWrongSet(wrong_set,mode): # Load the image/csv
    return json.dumps(api.openWrongSet(wrong_set,mode))


@app.route("/save_wrongset")
def saveWrongSet():
    return json.dumps(api.saveWrongSet())


@app.route("/close_wrongset")
def closeWrongSet():
    return json.dumps(api.closeWrongSet())

    
@app.route("/pointslist")
def getPointsList(): # Return all points of current image
    return json.dumps(api.getPointsList())


@app.route("/pointinfo/<wrong_corner>")
def getPointInfo(wrong_corner): # Return 4 neightbors of pointIdx
    return json.dumps(api.getPointInfo(int(wrong_corner)))

@app.route("/imageshape")
def getImageShape():
    return json.dumps(api.getImageShape())

@app.route("/image/<mode>/<color>")
def getImage(mode,color):# Return image
    isUndistort = True if mode == "undistorted" else False
    isGrayScale = True if color == "gray" else False
    print(f"getImage isUndistort : {mode}")
    frame = api.getImage(isUndistort, isGrayScale)
    print(f"getImage : {frame.shape}")
    ret, buffer = cv2.imencode('.png', frame)
    frame = buffer.tobytes()
    rtv = make_response(frame)
    print(rtv)
    return rtv

@app.route("/cropimage/<x>/<y>/<w>/<h>/<isUndistort>")
def getCropImage(x: int,y: int,w: int,h: int,isUndistort = False):
    return json.dumps(api.getCropImage(int(x),int(y),int(w),int(h),bool(isUndistort)))

@app.route("/next_missing")    
def getNextMissing():
    rtv = json.dumps(api.getNextMissing())
    print("getNextMissing :" + rtv)
    return rtv

@app.route("/update_point/<point_id>", methods=["PATCH"])
def updatePoint(point_id):
    new_data = request.get_data()
    # new_data = json.loads(request.get_data())
    return json.dumps(api.updatePoint(int(point_id),new_data))

    
@app.route("/open_workspace/",methods=["PATCH"])
def openWorkspace(directory=None):
    directory = request.get_data().decode()
    return json.dumps(api.openWorkspace(directory))

@app.route("/update_gridshape/<width>/<height>")
def updateGridShape(width,height):
    return json.dumps(api.updateGridShape(int(width),int(height)))

# OpenDirectoryDialog 
@app.route("/open_directory_dialog/list", methods=["PATCH"])
def listDir():
    path = request.get_data()
    dirfileList = os.listdir(path)
    dirList = ['..']
    for file in dirfileList:
        if(os.path.isdir(os.path.join(path,file))):
            dirList.append(file.decode())
    dirList = natsorted(dirList)
    return json.dumps(dirList)

@app.route("/open_directory_dialog/isexist", methods=["PATCH"])
def isDirExist():
    path = request.get_data()
    return json.dumps(os.path.isdir(path))

@app.route("/open_directory_dialog/link")
def getPredefinedLink():
    linkList = []
    def addLink(link):
        if(os.path.isdir(link['url'])):
            linkList.append(link)
    addLink({'name': "Start", 'url': os.getcwd()})
    addLink({'name': "Home", 'url': os.path.expanduser('~')})
    addLink({'name': "Desktop", 'url': os.path.join(os.path.expanduser('~'), 'Desktop')})
    addLink({'name': "Documents", 'url': os.path.join(os.path.expanduser('~'), 'Documents')})
    addLink({'name': "Downloads", 'url': os.path.join(os.path.expanduser('~'), 'Downloads')})
    return json.dumps(linkList)

port = "8080"
if(args.port is not None and args.port != "0"):
    port = int(args.port)
else:
    # Chose a random available port by binding to port 0
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('0.0.0.0', 0))
    sock.listen()

    # Tells the underlying WERKZEUG server to use the socket we just created
    os.environ['WERKZEUG_RUN_MAIN'] = 'true'
    os.environ['WERKZEUG_SERVER_FD'] = str(sock.fileno())

    # Update the configuration so it matches with the port we just chose
    # (sock.getsockname will return the actual port being used, not 0)
    app.config['SERVER_NAME'] = '%s:%d' % (sock.getsockname())
    port = sock.getsockname()[1]
if(args.browser):
    Timer(1,  lambda: webbrowser.open(f"http://0.0.0.0:{port}")).start()

print(f"Server is running on http://{app.config['SERVER_NAME']}")

app.run(host='0.0.0.0', port=port)
sys.exit()
