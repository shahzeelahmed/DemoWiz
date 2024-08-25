// // // // // // import React, { useEffect, useRef } from 'react';

// // // // // // const VideoDecoderCanvas = ({ videoPath }) => {
// // // // // //   const canvasRef = useRef(null);
// // // // // // //   videoPath = 'src/components/flower.webm'

// // // // // //   useEffect(() => {
// // // // // //     const loadAndDecodeVideo = async (videoPath) => {
// // // // // //       const response = await fetch(videoPath);
// // // // // //       const reader = response.body.getReader();

// // // // // //       const { codec } = await getVideoTrack(videoPath);

// // // // // //       const videoDecoder = new VideoDecoder({
// // // // // //         output: (frame) => drawFrame(frame),
// // // // // //         error: (e) => console.error(e),
// // // // // //       });

// // // // // //       videoDecoder.configure({ codec });

// // // // // //       let done = false;
// // // // // // try{
// // // // // //       while (!done) {
// // // // // //         const { done: readerDone, value } = await reader.read();
// // // // // //         if (readerDone) {
// // // // // //           done = true;
// // // // // //           videoDecoder.flush();
// // // // // //         } else {
// // // // // //           const chunk = new EncodedVideoChunk({
// // // // // //             type: 'key',
// // // // // //             timestamp: 0,
// // // // // //             data: value,
// // // // // //           });
// // // // // //           videoDecoder.decode(chunk);
// // // // // //         }
// // // // // //       }}
// // // // // //       catch(e){
// // // // // //         console.log(e)
// // // // // //       }
// // // // // //     }

// // // // // //     const drawFrame = (frame) => {
// // // // // //       const canvas = canvasRef.current;
// // // // // //       const ctx = canvas.getContext('2d');

// // // // // //       // Resize canvas to match video frame dimensions
// // // // // //       canvas.width = frame.displayWidth;
// // // // // //       canvas.height = frame.displayHeight;

// // // // // //       // Draw the frame to the canvas
// // // // // //       ctx.drawImage(frame, 0, 0, frame.displayWidth, frame.displayHeight);

// // // // // //       // Release the frame resources
// // // // // //       frame.close();
// // // // // //     };

// // // // // //     const getVideoTrack = async (videoPath) => {
// // // // // //       const video = document.createElement('video');
// // // // // //       video.src = videoPath;
// // // // // //   try{
// // // // // //       return new Promise((resolve, reject) => {
// // // // // //         video.onloadedmetadata = () => {
// // // // // //           const track = video.videoTracks[0];
// // // // // //           resolve({ codec: track?.codec });
// // // // // //         };
// // // // // //         video.onerror = reject;
// // // // // //       });}
// // // // // //       catch(e){
// // // // // //         console.log(e)

// // // // // //     }
// // // // // //     };

// // // // // //     loadAndDecodeVideo(videoPath);
// // // // // //   }, [videoPath]);

// // // // // //   return <canvas  />;
// // // // // // };

// // // // // // export default VideoDecoderCanvas;


import React, { useEffect, useRef } from 'react';

const VideoDecode = ({ videoPath }) => {
  const canvasRef = useRef(null);
  const decoderRef = useRef(null);
  const sourceBufferRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const init = async () => {
      // Create a VideoDecoder
      const decoder = new VideoDecoder({
        output: (frame) => {
          ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
          frame.close();
        },
        error: (error) => console.error('Decoder error:', error),
      });
      decoderRef.current = decoder;

      // Fetch the video file
      const response = await fetch(videoPath);
      const videoData = await response.arrayBuffer();

      // Create a MediaSource and SourceBuffer
      const mediaSource = new MediaSource();
      const sourceBuffer = await new Promise((resolve) => {
        mediaSource.addEventListener('sourceopen', () => {
          const sb = mediaSource.addSourceBuffer('video/mp4');
          resolve(sb);
        });
      });
      sourceBufferRef.current = sourceBuffer;

      // Append the video data to the SourceBuffer
      sourceBuffer.addEventListener('updateend', () => {
        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
          mediaSource.endOfStream();
        }
      });
      sourceBuffer.appendBuffer(videoData);
        
      // Start decoding
      decoder.configure({
        codec: 'AVC1', // You might need to adjust this based on your video codec
        codedWidth: canvas.width,
        codedHeight: canvas.height,
      });

      // Create a MediaStreamTrackProcessor to get video frames
      const track = new MediaStreamTrackProcessor({ track: canvas.captureStream().getVideoTracks()[0] });
      const reader = track.readable.getReader();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        decoder.decode(value);
      }
    };

    init();

    return () => {
      if (decoderRef.current) {
        decoderRef.current.close();
      }
      if (sourceBufferRef.current) {
        sourceBufferRef.current.abort();
      }
    };
  }, [videoPath]);

  return <canvas ref={canvasRef} width={640} height={360} />;
};

export default VideoDecode;
// import React, { useEffect, useRef } from 'react';

// const VideoDecode = ({ videoPath }) => {
//   const canvasRef = useRef(null);
//   const decoderRef = useRef(null);
//   const sourceBufferRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');

//     const init = async () => {
//       console.log('Initializing decoder...');
//       const decoder = new VideoDecoder({
//         output: (frame) => {
//           console.log('Received frame:', frame.width, 'x', frame.height);
//           ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
//           frame.close();
//         },
//         error: (error) => console.error('Decoder error:', error),
//       });
//       decoderRef.current = decoder;

//       console.log('Fetching video data...');
//       const response = await fetch(videoPath);
//       const videoData = await response.arrayBuffer();
//       console.log('Video data fetched, size:', videoData.byteLength);

//       console.log('Setting up MediaSource...');
//       const mediaSource = new MediaSource();
//       const sourceBuffer = await new Promise((resolve) => {
//         mediaSource.addEventListener('sourceopen', () => {
//           const sb = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"');
//           resolve(sb);
//         });
//       });
//       sourceBufferRef.current = sourceBuffer;

//       sourceBuffer.addEventListener('updateend', () => {
//         console.log('SourceBuffer updated');
//         if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
//           mediaSource.endOfStream();
//           console.log('MediaSource stream ended');
//         }
//       });
//       sourceBuffer.appendBuffer(videoData);

//       console.log('Configuring decoder...');
//       decoder.configure({
//         codec: 'avc1.42E01E',
//         codedWidth: canvas.width,
//         codedHeight: canvas.height,
//       });

//       console.log('Starting decoding process...');
//       const track = new MediaStreamTrackProcessor({ track: canvas.captureStream().getVideoTracks()[0] });
//       const reader = track.readable.getReader();

//       while (true) {
//         const { value, done } = await reader.read();
//         if (done) {
//           console.log('Decoding finished');
//           break;
//         }
//         console.log('Decoding frame...');
//         decoder.decode(value);
//       }
//     };

//     init().catch(console.error);

//     return () => {
//       if (decoderRef.current) {
//         decoderRef.current.close();
//       }
//       if (sourceBufferRef.current) {
//         sourceBufferRef.current.abort();
//       }
//     };
//   }, [videoPath]);

//   return <canvas ref={canvasRef} width={640} height={360} />;
// };

// export default VideoDecode;

// // // import React, { useEffect, useRef, useState } from 'react';

// // // const H264Decoder = ({ videoPath }) => {
// // //   const canvasRef = useRef(null);
// // //   const videoRef = useRef(null);
// // //   const [error, setError] = useState(null);

// // //   useEffect(() => {
// // //     const canvas = canvasRef.current;
// // //     const ctx = canvas.getContext('2d');
// // //     const video = videoRef.current;

// // //     let decoder;

// // //     const initDecoder = async () => {
// // //       try {
// // //         console.log('Initializing decoder...');
// // //         decoder = new VideoDecoder({
// // //           output: (frame) => {
// // //             ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
// // //             frame.close();
// // //           },
// // //           error: (error) => {
// // //             console.error('Decoder error:', error);
// // //             setError('Decoder error: ' + error.message);
// // //           }
// // //         });

// // //         await decoder.configure({
// // //           codec: 'avc1.42E01E',
// // //           codedWidth: canvas.width,
// // //           codedHeight: canvas.height,
// // //         });

// // //         console.log('Decoder initialized');
// // //       } catch (error) {
// // //         console.error('Failed to initialize decoder:', error);
// // //         setError('Failed to initialize decoder: ' + error.message);
// // //       }
// // //     };

// // //     const startDecoding = async () => {
// // //       try {
// // //         console.log('Fetching video data...');
// // //         const response = await fetch(videoPath);
// // //         if (!response.ok) {
// // //           throw new Error(`HTTP error! status: ${response.status}`);
// // //         }
// // //         const data = await response.arrayBuffer();
// // //         console.log('Video data fetched, size:', data.byteLength);

// // //         console.log('Setting up MediaSource...');
// // //         const mediaSource = new MediaSource();
// // //         video.src = URL.createObjectURL(mediaSource);

// // //         mediaSource.addEventListener('sourceopen', () => {
// // //           console.log('MediaSource opened');
// // //           try {
// // //             const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"');
// // //             console.log('SourceBuffer added');

// // //             sourceBuffer.addEventListener('updateend', () => {
// // //               console.log('SourceBuffer updated');
// // //               if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
// // //                 mediaSource.endOfStream();
// // //                 console.log('MediaSource stream ended');
// // //                 video.play().catch(e => {
// // //                   console.error('Error playing video:', e);
// // //                   setError('Error playing video: ' + e.message);
// // //                 });
// // //               }
// // //             });

// // //             sourceBuffer.addEventListener('error', (e) => {
// // //               console.error('SourceBuffer error:', e);
// // //               setError('SourceBuffer error: ' + e.message);
// // //             });

// // //             console.log('Appending buffer to SourceBuffer...');
// // //             sourceBuffer.appendBuffer(data);
// // //           } catch (error) {
// // //             console.error('Error in sourceopen event:', error);
// // //             setError('Error in sourceopen event: ' + error.message);
// // //           }
// // //         });

// // //         mediaSource.addEventListener('sourceended', () => {
// // //           console.log('MediaSource ended');
// // //         });

// // //         mediaSource.addEventListener('sourceclose', () => {
// // //           console.log('MediaSource closed');
// // //         });

// // //       } catch (error) {
// // //         console.error('Error in startDecoding:', error);
// // //         setError('Error in startDecoding: ' + error.message);
// // //       }
// // //     };

// // //     initDecoder().then(startDecoding);

// // //     return () => {
// // //       if (decoder) {
// // //         decoder.close();
// // //       }
// // //     };
// // //   }, [videoPath]);

// // //   if (error) {
// // //     return <div>Error: {error}</div>;
// // //   }

// // //   return (
// // //     <div>
// // //       <canvas ref={canvasRef} width={640} height={360} style={{ border: '1px solid black' }} />
// // //       <video ref={videoRef} style={{ display: 'none' }} />
// // //     </div>
// // //   );
// // // };

// // // export default H264Decoder;
// // import React, { useEffect, useRef, useState } from 'react';

// // const H264Decoder = ({ videoPath }) => {
// //   const videoRef = useRef(null);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     if (!('MediaSource' in window)) {
// //       setError('MediaSource API is not supported in this browser');
// //       return;
// //     }

// //     const video = videoRef.current;
// //     const mediaSource = new MediaSource();
// //     video.src = URL.createObjectURL(mediaSource);

// //     mediaSource.addEventListener('sourceopen', async () => {
// //       console.log('MediaSource opened');

// //       const mimeTypes = [
// //         'video/mp4; codecs="avc1.42E01E"',
// //         'video/mp4; codecs="avc1.4D401E"',
// //         'video/mp4; codecs="avc1.64001E"',
// //         'video/mp4; codecs="avc1.42001E"',
// //         'video/mp4',
// //       ];

// //       let supportedMimeType = mimeTypes.find(mimeType => 
// //         MediaSource.isTypeSupported(mimeType)
// //       );

// //       if (!supportedMimeType) {
// //         setError('No supported MIME type found');
// //         return;
// //       }

// //       console.log('Using MIME type:', supportedMimeType);

// //       try {
// //         const sourceBuffer = mediaSource.addSourceBuffer(supportedMimeType);
// //         console.log('SourceBuffer added');

// //         const response = await fetch(videoPath);
// //         if (!response.ok) {
// //           throw new Error(`HTTP error! status: ${response.status}`);
// //         }
// //         const data = await response.arrayBuffer();
// //         console.log('Video data fetched, size:', data.byteLength);

// //         sourceBuffer.addEventListener('updateend', () => {
// //           if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
// //             mediaSource.endOfStream();
// //             console.log('MediaSource stream ended');
// //             video.play().catch(e => console.error('Error playing video:', e));
// //           }
// //         });

// //         sourceBuffer.appendBuffer(data);
// //       } catch (error) {
// //         console.error('Error:', error);
// //         setError('Error: ' + error.message);
// //       }
// //     });
// //   }, [videoPath]);

// //   if (error) {
// //     return <div>Error: {error}</div>;
// //   }

// //   return (
// //     <video ref={videoRef} controls width="640" height="360">
// //       Your browser does not support the video tag.
// //     </video>
// //   );
// // };

// // export default H264Decoder;


// import React, { useEffect, useRef, useState } from 'react';

// const VideoDecode = ({ videoPath }) => {
//   const canvasRef = useRef(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!('VideoDecoder' in window)) {
//       setError('WebCodecs API is not supported in this browser');
//       return;
//     }

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     let decoder;

//     const initDecoder = async () => {
//       try {
//         decoder = new VideoDecoder({
//           output: frame => {
//             ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
//             frame.close();
//           },
//           error: e => {
//             console.error('Decoder error:', e);
//             setError('Decoder error: ' + e.message);
//           }
//         });

//         await decoder.configure({
//           codec: 'avc1.42E01E', // You might need to adjust this based on your video
//           codedWidth: canvas.width,
//           codedHeight: canvas.height,
//         });

//         console.log('Decoder initialized');
//       } catch (e) {
//         console.error('Decoder initialization error:', e);
//         setError('Decoder initialization error: ' + e.message);
//       }
//     };

//     const decodeVideo = async () => {
//       try {
//         const response = await fetch(videoPath);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const videoData = await response.arrayBuffer();
        
//         const demuxer = new MP4Demuxer(videoData);
//         for await (const chunk of demuxer.getChunks()) {
//           decoder.decode(chunk);
//         }
//       } catch (e) {
//         console.error('Decoding error:', e);
//         setError('Decoding error: ' + e.message);
//       }
//     };

//     initDecoder().then(decodeVideo);

//     return () => {
//       if (decoder) {
//         decoder.close();
//       }
//     };
//   }, [videoPath]);

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return <canvas ref={canvasRef} width={640} height={360} />;
// };

// // Simple MP4 demuxer (you might need a more robust one for production use)
// class MP4Demuxer {
//   constructor(buffer) {
//     this.buffer = buffer;
//     this.offset = 0;
//   }

//   async *getChunks() {
//     while (this.offset < this.buffer.byteLength) {
//       const boxSize = new DataView(this.buffer, this.offset, 4).getUint32(0);
//       const boxType = new TextDecoder().decode(new Uint8Array(this.buffer, this.offset + 4, 4));

//       if (boxType === 'mdat') {
//         yield new EncodedVideoChunk({
//           type: 'key',
//           data: new Uint8Array(this.buffer, this.offset + 8, boxSize - 8),
//           timestamp: 0,
//           duration: 0,
//         });
//       }

//       this.offset += boxSize;
//     }
//   }
// }

// export default VideoDecode;
// import React, { useEffect, useRef, useState } from 'react';

// const VideoDecode = ({ videoPath }) => {
//   const canvasRef = useRef(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!('VideoDecoder' in window)) {
//       setError('WebCodecs API is not supported in this browser');
//       return;
//     }

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     let decoder;

//     const initDecoder = async (config) => {
//       try {
//         decoder = new VideoDecoder({
//           output: frame => {
//             ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
//             frame.close();
//           },
//           error: e => {
//             console.error('Decoder error:', e);
//             setError('Decoder error: ' + e.message);
//           }
//         });

//         await decoder.configure(config);
//         console.log('Decoder initialized');
//       } catch (e) {
//         console.error('Decoder initialization error:', e);
//         setError('Decoder initialization error: ' + e.message);
//       }
//     };

//     const decodeVideo = async () => {
//       try {
//         const response = await fetch(videoPath);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const videoData = await response.arrayBuffer();
        
//         const demuxer = new MP4Demuxer(videoData);
//         const { codec, codedWidth, codedHeight, description } = await demuxer.getConfig();
        
//         await initDecoder({
//           codec,
//           codedWidth,
//           codedHeight,
//           description
//         });

//         for await (const chunk of demuxer.getChunks()) {
//           decoder.decode(chunk);
//         }
//       } catch (e) {
//         console.error('Decoding error:', e);
//         setError('Decoding error: ' + e.message);
//       }
//     };

//     decodeVideo();

//     return () => {
//       if (decoder) {
//         decoder.close();
//       }
//     };
//   }, [videoPath]);

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return <canvas ref={canvasRef} width={640} height={360} />;
// };

// class MP4Demuxer {
//   constructor(buffer) {
//     this.buffer = buffer;
//     this.offsets = {
//       moov: 0,
//       mdat: 0
//     };
//   }

//   async getConfig() {
//     // Find moov box
//     this.offsets.moov = this.findBox('moov');
//     if (this.offsets.moov === -1) throw new Error('moov box not found');

//     // Find avcC box (inside moov -> trak -> mdia -> minf -> stbl -> stsd -> avc1)
//     const avcCOffset = this.findBox('avcC', this.offsets.moov);
//     if (avcCOffset === -1) throw new Error('avcC box not found');

//     // Extract codec string
//     const view = new DataView(this.buffer, avcCOffset, 8);
//     const profileByte = view.getUint8(1);
//     const levelByte = view.getUint8(3);
//     const codec = `avc1.${profileByte.toString(16).padStart(2, '0')}${levelByte.toString(16).padStart(2, '0')}`;

//     // Extract width and height
//     const trackOffset = this.findBox('tkhd', this.offsets.moov);
//     const trackView = new DataView(this.buffer, trackOffset, 100);
//     const width = trackView.getUint32(74);
//     const height = trackView.getUint32(78);

//     // Extract avcC data for description
//     const avcCLength = view.getUint32(0);
//     const description = new Uint8Array(this.buffer, avcCOffset, avcCLength);

//     return { codec, codedWidth: width, codedHeight: height, description };
//   }

//   findBox(boxName, start = 0) {
//     const dataView = new DataView(this.buffer);
//     let offset = start;

//     while (offset < this.buffer.byteLength) {
//       const boxSize = dataView.getUint32(offset);
//       const type = String.fromCharCode(
//         dataView.getUint8(offset + 4),
//         dataView.getUint8(offset + 5),
//         dataView.getUint8(offset + 6),
//         dataView.getUint8(offset + 7)
//       );

//       if (type === boxName) return offset + 8;
//       offset += boxSize;
//     }

//     return -1;
//   }

//   async *getChunks() {
//     // Find mdat box
//     this.offsets.mdat = this.findBox('mdat');
//     if (this.offsets.mdat === -1) throw new Error('mdat box not found');

//     const dataView = new DataView(this.buffer);
//     const mdatSize = dataView.getUint32(this.offsets.mdat - 8) - 8;
//     let offset = this.offsets.mdat;
//     let timestamp = 0;

//     while (offset < this.offsets.mdat + mdatSize) {
//       const naluSize = dataView.getUint32(offset);
//       const naluType = dataView.getUint8(offset + 4) & 0x1F;

//       yield new EncodedVideoChunk({
//         type: naluType === 5 ? 'key' : 'delta',
//         timestamp: timestamp,
//         duration: 0,
//         data: new Uint8Array(this.buffer, offset + 4, naluSize)
//       });

//       offset += naluSize + 4;
//       timestamp += 1000 / 30; // Assuming 30 fps, adjust as needed
//     }
//   }
// }

// export default VideoDecode;