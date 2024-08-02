// import createFFmpegCore from "@ffmpeg/core";
// import ffmpeg from "ffmpeg";
// import { useState } from "react"
// import { FFmpeg } from "@ffmpeg/ffmpeg";
// export default function Recorder(){
//     const [isRecording, setisRecording] = useState(false);
//     const [time, setTime] = useState("00:00");

//     function startRecording(){
//         const seconds = Math.floor((Date.now() - startTime) / 1000);
//         const minutes = Math.floor(seconds / 60);
//         const formattedSeconds =
//           seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60;
//         setTime(`${minutes}:${formattedSeconds}`);

      
//     }

//     function stopRecording(){
//         setTime("00:00");
//     }
//     return(
//         <></>
//     )
// }

// src/ScreenRecorder.js
import React from 'react';
import { invoke } from '@tauri-apps/api/tauri';

const ScreenRecorder = () => {
  const startRecording = async () => {
    await invoke('start_recording');
  };

  const stopRecording = async () => {
    await invoke('stop_recording');
  };

  return (
    <div>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
    </div>
  );
};

export default ScreenRecorder;
