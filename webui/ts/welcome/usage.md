# Welcome to Manual Label

Label the missing points when creating the ground truth/ calibration.

# Workspace structure

In order to check and label the detected grid point manually, the directory structure of the workspace should same as following:

* `log.json` : List points should be manual label. Generate from `image_label_line.py` and `gridpt_detect_and_sort.py`
* `cam_params.json` : Camera paramters
* `image` : Directory has images with patterns
    * `projector`
        * `patterns`
        * `boards`
    * `camera`
* `label` : Directory has labeled csv files


