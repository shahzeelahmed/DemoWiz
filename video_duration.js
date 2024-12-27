import {MP4Box} from './mp4box.all.js'
const mp4boxfile = MP4Box.createFile();



// Load the video file
fetch('jotaro.mp4')
    .then(response => response.arrayBuffer())
    .then(buffer => {
        mp4boxfile.onReady = function(info) {
           
            const durationInSeconds = info.duration / info.timescale;
            console.log('Duration (seconds):', durationInSeconds);
        };

        const arrayBuffer = buffer;
        arrayBuffer.fileStart = 0;
        mp4boxfile.appendBuffer(arrayBuffer);
        mp4boxfile.flush();
    });

 
