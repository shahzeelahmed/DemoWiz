import './App.css'
import React, { useEffect, useState } from 'react'
import Playhead from './components/timeline/playheadtest';
import DraggableTrack from './components/tracks/draggable';
import { AVCanvas } from '@webav/av-canvas';
import { useTrackStateStore } from './store/trackStore';
import {
  AudioClip,
  ImgClip,
  MP4Clip,
  VisibleSprite,
  renderTxt2ImgBitmap,
} from '@webav/av-cliper';
import { nanoid } from 'nanoid';
import { TrackRow } from './types/trackRowTypes';
import { TrackItemType } from './types/trackType';
import { loadFile } from './utils/helpers';


export default function App() {
  const [avCanvas, setAvCanvas] = useState<AVCanvas | null>(null);
  const [playing, setPlaying] = useState(false);
  const rowStore = useTrackStateStore()
  const [clip,setClip] = useState<ReadableStream<Uint8Array> | null> (null)
  const [duration,setDuration] = useState(0)
  const [time,setTime] = useState(0)
  const items = rowStore.tracks
  const [cvsWrapEl, setCvsWrapEl] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (cvsWrapEl == null) return;
    avCanvas?.destroy();
    const cvs = new AVCanvas(cvsWrapEl, {
      bgColor: '#000',
      width: 1280,
      height: 720,
    });
    setAvCanvas(cvs);
    cvs.on('timeupdate', (time) => {
      if (time == null) return;
      setTime(time / 1e6);
    });
    cvs.on('playing', () => {
      setPlaying(true);
    });
    cvs.on('paused', () => {
      setPlaying(false);
    });

    return () => {
      cvs.destroy();
    };
  }, [cvsWrapEl]);
  
    
  
const actionSpriteMap = new WeakMap<TrackItemType, VisibleSprite>();
 async function addSpriteToRow(trackId: string, spr: VisibleSprite, type = '') {
    const row = rowStore.trackLines;
    

    // const start =
    //   spr.time.offset === 0
    //     ? Math.max(...row.trackItem.map((item) => item.endTime ), 0) * 1e6
    //     : spr.time.offset;

    // spr.time.offset = start;

    if (spr.time.duration === Infinity) {
      spr.time.duration = 10e6;
    }
    if(!clip) return;
    const track = new MP4Clip(clip)
    const {duration,height, width, } = await track.ready
    setDuration(duration)
console.log('rate',spr.time.playbackRate) 
    const action = [{
      id: nanoid(5),
      duration: duration,
      startTime: start / 1e6,
      endTime: (spr.time.offset + spr.time.duration) / 1e6,
      type: type,

    } ]as  TrackItemType[];

    actionSpriteMap.set(action[0], spr);

    rowStore.addTrack(action)
   
    
    return action;
  }
  useEffect(()=>{
    console.log('items',items.map((e) => e.id))
  },[items])
  return (
    <>
       <div className="canvas-wrap ">
      <div className='h-[400px]'  ref={(el) => setCvsWrapEl(el)}></div>
      </div>
        <button
        className="mx-[10px]"
        onClick={async () => {
          const stream = (await loadFile({ 'video/*': ['.mp4', '.mov'] })).stream()
            
          const spr = new VisibleSprite(
            new MP4Clip(stream, {
              
            }),
          );
          setClip(stream[0])
          await avCanvas?.addSprite(spr);
          const id = nanoid(5);
          addSprite2Track(id, spr, 'video');
        }}
      >
        + add media
      </button>
   <DraggableTrack/>
   </>
  );
}

