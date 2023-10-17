# Manual Label
(I removed some sensitive data from origin development repository)

The working is for labeling the missing grid points like grid in [DOE-based structured-light method for accurate 3D sensing](https://www.sciencedirect.com/science/article/abs/pii/S0143816618317408) 

# Workspace structure

In order to check and label the detected grid point manually, the directory structure of the workspace should same as following:

* label/
```csv
, 0, 1
NODE_INDEX1, Y_COORDINATE, X_COORDINATE
NODE_INDEX2, Y_COORDINATE, X_COORDINATE
...
```
* data/
    * projector/
        * patterns/
        * boards/
    * camera/
* cam_params.json
* log.json
```json
{
    "FILENAME_WITHOUT_EXTENSION" : [ 
        // ex FILENAME_WITHOUT_EXTENSION is 00, the real name of the file will be 00.csv, 00_update.csv
        // "NODES_TO_BE_LABELED"
        0,
        1,
        ...
    ]
}
```

# Python Dependencies

* flask
* opencv

# Credits
* [JackyChen0725 ](https://github.com/JackyChen0725) : For testing the application and fix some bug
* [youxin1231](https://github.com/youxin1231) : For inital labeling flow

