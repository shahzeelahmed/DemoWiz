import cv2
import numpy as np
import pyautogui
import json
from win32api import LoadCursor
from win32api import SetWindowLong
import time 
import sys
import pygetwindow as gw
SCREEN_SIZE = tuple(pyautogui.size())

# define the codec
fourcc = cv2.VideoWriter_fourcc(*"mp4v")
# frames per second
fps = 45.0
prev = 0
# create the video write object

record_seconds = 10
# w_name = sys.argv[1]
# window_name = sys.argv[1]
# window = gw.getWindowsWithTitle("Whatsapp")[0]

# # # activate the window
# window.activate()
# x1, y1, x2, y2 = window.left, window.top, window.left + window.width, window.top + window.height
# SCREEN_SIZE = ( x1, y1, x2, y2)
out = cv2.VideoWriter("output.mp4", fourcc, 20.0, SCREEN_SIZE)
# the time you want to record in seconds

# X, Y= pyautogui.position().__dict__({
#     "x": X,
#     "y": Y
# })



# for i in range(int(record_seconds * fps)):
while True:
    time_elapsed = time.time() - prev
    img = pyautogui.screenshot()
    # make a screenshot
    if time_elapsed > 1.0/fps:
        prev = time.time()
        
    # convert these pixels to a proper numpy array to work with OpenCV
        frame = np.array(img)
    # convert colors from BGR to RGB
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    # write the frame
        out.write(frame)
    
    
        x, y = pyautogui.position()
        positionStr = 'X: ' + str(x).rjust(4) + ' Y: ' + str(y).rjust(4)
        print(positionStr, end='')
        print('\b' * len(positionStr), end='', flush=True)
        print('\n')

    cv2.waitKey(1)
        

# make sure everything is closed when exited
cv2.destroyAllWindows()
out.release()