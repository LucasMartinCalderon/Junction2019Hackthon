import cv2 as cv
import numpy as np
from contour import *
from lightControl import InitLights
from lightControl import Blink
from lightControl import Off
import threading as thread
from time import sleep

backSub = cv.createBackgroundSubtractorMOG2()
Serial_Device = InitLights()
cap = cv.VideoCapture('output.avi')
#fps = 60
#frame_width = 110
#frame_height = 180
#out_writer = cv.VideoWriter('output_processed.avi',
#        cv.VideoWriter_fourcc('M','J','P','G'),
#        fps,
#        (frame_width,frame_height))

direction = 5
count = 0
finder = PersonFinder()
reset = False
last_cnt = None
#TODO implement stable noise precausion
while(True):
    ret, new_frame = cap.read()
    # fgMask = backSub.apply(new_frame)
    imgray = cv.cvtColor(new_frame, cv.COLOR_BGR2GRAY)
    ret,thresh = cv.threshold(imgray, 200, 255, cv.THRESH_BINARY)
    thresh, contours = get_contours(new_frame)
    direction, final_cnt = finder.get_new_cors(contours, direction)
    if last_cnt is not None:
        last_rect = cv.minAreaRect(last_cnt)
        new_rect = cv.minAreaRect(final_cnt)
        if ((last_rect[0][0]-new_rect[0][0])**2+(last_rect[0][1]-new_rect[0][1])**2) > 50:
            reset = True
    last_cnt = final_cnt
    for row in thresh:
        for i in range(len(row)):
            row[i] = 255
    #for cnt in contours:
    #    cv.drawContours(thresh, [cnt], 0, (183,23,100), -1)
    cv.drawContours(thresh, [final_cnt], 0, (183,23,100), -1)
    if reset == True:
        if thread.active_count() == 1:
            thread.Thread(target=Off, args=(2, Serial_Device)).start()
            reset = False
            print("OFF")
    elif direction > 9 and thread.active_count() == 1:
        thread.Thread(target=Blink, args=(1,"EC86", Serial_Device)).start()
        print("further EC86")
    elif thread.active_count() == 1:
        thread.Thread(target=Blink, args=(1,"ECC5",Serial_Device)).start()
        print("closer ECC5")
    #cv.circle(thresh, (50, 130), 1, color=(0,255,255), thickness=2, lineType=8, shift=0)
    #namedWindow("Display frame", WINDOW_NORMAL)
    cv.resizeWindow("Display frame", 400, 400);


    cv.imshow('Display frame', thresh)
    resized = cv.resize(new_frame, (110 * 3,180 * 3), interpolation = cv.INTER_AREA)
    x,y,w,h = cv.boundingRect(final_cnt)
    cv.rectangle(resized,(x*3,y*3),(x*3+w*3,y*3+h*3),(0,0,255),2)

    cv.imshow('Reference', resized)

    #out_writer.write(thresh)
    cv.waitKey(25)

# out_writer.release()
