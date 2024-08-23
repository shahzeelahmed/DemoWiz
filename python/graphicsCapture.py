from windows_capture import WindowsCapture, Frame, InternalCaptureControl
import cv2
import time
import numpy as np
import av
# Every Error From on_closed and on_frame_arrived Will End Up Here
capture = WindowsCapture(
    cursor_capture=None,
    draw_border=None,
    monitor_index=None,
    window_name=None,
)
frame_count = 0
last_time = time.time()
target_fps = 60
writer = cv2.VideoWriter(
        "newtest.avi", cv2.VideoWriter_fourcc(*'XVID'), target_fps, (1920, 1080)
    )
imgframe = None
@capture.event
# while True:
def on_frame_arrived(frame: Frame, capture_control: InternalCaptureControl):    
    print("new frame arrived")
    global frame_count
    global last_time
    container = av.open("test69.mp4", mode="w")

    stream = container.add_stream("mpeg4", rate=30)
    img = av.VideoFrame.from_ndarray(frame.frame_buffer, format="rgb24")
    stream.width = 1920
    stream.height = 1080
    for packet in stream.encode(img):
        container.mux(packet)
    for packet in stream.encode():
        container.mux(packet)

# Close the file
    container.close()    
    
    _frame_buffer = frame.frame_buffer

    frame_count += 1
    current_time = time.time()
    
    if current_time - last_time >= 1:
        fps = frame_count / (current_time - last_time)
        print(f"FPS: {fps:.2f}")
        frame_count = 0
        last_time = current_time

    capture_control.stop()

@capture.event    
def on_closed():
    print("Capture Session Closed")   
start_time = time.time()

capture.start() 
# def start_capture():
#     # start_time = time.time()
    
#     # while time.time() - start_time < 5:
        
#     #     pass
        

# start_capture()        


# Called Every Time A New Frame Is Available
# @capture.event

# def on_frame_arrived(frame: Frame, capture_control: InternalCaptureControl):

#     print("New Frame Arrived")
#     fourcc = cv2.VideoWriter_fourcc(*'XVID')
#     out =  cv2.VideoWriter('Testnew.avi', fourcc, 60, (1920, 1080))
#     out.write(frame.frame_buffer)
#     cv2.imshow('frame',frame.frame_buffer)
        
#         # Check if the capture should be stopped
#     # if capture_control.is_finished():
#     #     capture_control.stop()

#     # Set the on_closed event handler
  
    
#     # Start the capture in a separate thread
#     # capture_control = capture.start_free_threaded()
    
#     # Create the video writer
    
    
#     # Record for 5 seconds
#     start_time = time.time()
#     while time.time() - start_time < 5:

#         pass


    
        

#     capture_control.stop()
    



# @capture.event
# def on_closed():
#     print("Capture Session Closed")


# capture.start()
# Frame.record_screen_video('output_video.mp4')