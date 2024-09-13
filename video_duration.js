import {MP4Box} from './mp4box.all.js'
const mp4boxfile = MP4Box.createFile();

// Function to handle file buffer
function arrayBufferToString(buffer) {
    let bufView = new Uint8Array(buffer);
    let length = bufView.length;
    let result = '';
    let addition = Math.pow(2, 16) - 1;

    for (let i = 0; i < length; i += addition) {
        if (i + addition > length) {
            addition = length - i;
        }
        result += String.fromCharCode.apply(null, bufView.subarray(i, i + addition));
    }
    return result;
}

// Load the video file
fetch('video2.mp4')
    .then(response => response.arrayBuffer())
    .then(buffer => {
        mp4boxfile.onReady = function(info) {
            // Duration is in movie_timescale units, convert it to seconds
            const durationInSeconds = info.duration / info.timescale;
            console.log('Duration (seconds):', durationInSeconds);
        };

        const arrayBuffer = buffer;
        arrayBuffer.fileStart = 0;
        mp4boxfile.appendBuffer(arrayBuffer);
        mp4boxfile.flush();
    });


