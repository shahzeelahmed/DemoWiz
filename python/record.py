import dxcam
import cv2


target_fps = 60
camera = dxcam.create(output_idx=0, output_color="BGR")

camera.start(target_fps=target_fps, video_mode=True)

writer = cv2.VideoWriter(
        "video.mp4", cv2.VideoWriter_fourcc(*"mp4v"), target_fps, (1920, 1080)
    )
for i in range(600):
    writer.write(camera.get_latest_frame())

    
camera.stop()
writer.release()     
        
    
