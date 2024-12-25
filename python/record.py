import dxcam
import cv2
import numpy as np


target_fps = 60
camera = dxcam.create(output_idx=0, output_color="BGR")

camera.start(target_fps=target_fps, video_mode=True)

writer = cv2.VideoWriter(
        "test61.avi", cv2.VideoWriter_fourcc(*"XVID"), target_fps, (1920, 1080)
    )
for i in range(600):
    frame = np.array(camera.get_latest_frame())
    
    writer.write(frame)

    
camera.stop()
writer.release()     
        

        #  def record_as_video(self) -> None:
        # img = self.frame_buffer
        
        # """record video"""        
        # writer = cv2.VideoWriter("test.avi", cv2.VideoWriter_fourcc(*'XVID'), 60, (1920, 1080))
    
        
        # while True:
            
        #     writer.write(img)
        #     cv2.imshow('Live', img)
        #     if cv2.waitKey(1) == ord("q"):
        #         cv2.destroyAllWindows()
        #         break
            
        # writer.release()
    
