import argparse
import ctypes
import os
import signal
from threading import Thread
from typing import List
import windows_capture

from common import add_common_args
import cv2
import numpy as np

from wincam import DXCamera, Timer



def get_argument_parser():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser("Record an mp4 video of the screen.")
    add_common_args(parser)
    parser.add_argument(
        "--output",
        help="Name of video file to save (default 'video.mp4')",
        default="video3.mp4",
    )
    return parser


def parse_handle(hwnd) -> int:
    if hwnd.startswith("0x"):
        return int(hwnd[2:], 16)
    return int(hwnd)


class VideoRecorder:
    def __init__(self, output: str = "video3.mp4"):
        self._thread: Thread | None = None
        self._stop = False
        self._output = output
        self._video_writer: cv2.VideoWriter | None = None
        self._frames: List[np.ndarray] = []
        self._timer = Timer()
        signal.signal(signal.SIGINT, self._signal_handler)

    def _signal_handler(self, sig, frame):
        self._stop = True

    def video_thread(self, x: int, y: int, w: int, h: int, fps: int):
        steps = []
        with DXCamera(x, y, w, h, fps=fps) as camera:
            frame, timestamp = camera.get_bgr_frame()
            self._video_writer.write(frame)  # type: ignore
            camera.reset_throttle()

            while not self._stop:
                self._timer.start()
                frame, timestamp = camera.get_bgr_frame()
                self._frames += [frame]
                self._video_writer.write(frame)
                steps += [self._timer.ticks()]

        min_step = min(steps)
        max_step = max(steps)
        avg_step = sum(steps) / len(steps)
        print("Video saved to", self._output)
        print(f"frame step times, min: {min_step:.3f}, max: {max_step:.3f}, avg: {avg_step:.3f}")
        if avg_step > fps * 1.1:
            print(f"The video writer could not keep up with the target {fps} fps so the video will play too fast.")
            print("Please try a smaller window or a lower target fps.")

    def start(self, x: int, y: int, w: int, h: int, fps: int):
        self._video_writer = cv2.VideoWriter(
            self._output,
            cv2.VideoWriter.fourcc(*'avc1'),
            fps,
            (w, h),
        )
        self._thread = Thread(target=lambda: self.video_thread(x, y, w, h, fps))
        self._thread.start()

    def stop(self):
        self._stop = True
        if self._thread is not None:
            self._thread.join()
        self._video_writer.release()


def main():
    ctypes.windll.shcore.SetProcessDpiAwareness(2)
    parser = get_argument_parser()
    args = parser.parse_args()
    if args.debug:
        input(f"debug process {os.getpid()}")

    x, y, w, h = args.x, args.y, args.width, args.height
    if args.hwnd:
        hwnd = parse_handle(args.hwnd)
        from wincam.desktop import DesktopWindow

        desktop = DesktopWindow()
        x, y, w, h = desktop.get_window_client_bounds(hwnd)
    elif args.point:
        x, y = map(int, args.point.split(","))
        from wincam.desktop import DesktopWindow

        desktop = DesktopWindow()
        x, y, w, h = desktop.get_window_under_point((x, y))
    elif args.process:
        pid = int(args.process)
        from wincam.desktop import DesktopWindow

        desktop = DesktopWindow()
        
        x, y, w, h = desktop.find(pid)

    recorder = VideoRecorder(args.output)
    recorder.start(x, y, 1920, 1080, args.fps)
    # recorder.start(x,y,1920,1080,args.fps)
    input("Press ENTER to stop recording...")
    recorder.stop()


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
