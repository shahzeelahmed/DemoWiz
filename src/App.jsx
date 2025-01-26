import "./App.css";

import { MP4Clip } from '@webav/av-cliper';
import { Radio,Button,Divider } from 'antd';
import { useState } from 'react';
import { assetsPrefix } from "./utils/utils";

import React from "react";

const videos = assetsPrefix({
  'bunny.mp4': 'JOTARO VS KIRA 4K 60 FPS MhL_V19Su7o.mp4',
  'bear.mp4': 'JOTARO VS KIRA 4K 60 FPS MhL_V19Su7o.mp4',
});

let stop = () => {};

async function start(
  speed,
  videoType,
  ctx = OffscreenCanvasRenderingContext2D,
) {
  const resp1 = await fetch(videos[videoType]);
  const clip = new MP4Clip(resp1.body);
  await clip.ready;

  stop();

  if (speed === Infinity) {
    fastestDecode();
  } else {
    timesSpeedDecode(speed);
  }

  async function fastestDecode() {
    let time = 0;
    let stopted = false;

    stop = () => (stopted = true);

    while (!stopted) {
      const { state, video } = await clip.tick(time);
      if (state === 'done') break;
      if (video != null && state === 'success') {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(
          video,
          0,
          0,
          video.codedWidth,
          video.codedHeight,
          0,
          0,
          ctx.canvas.width,
          ctx.canvas.height,
        );
        video.close();
      }
      time += 33000;
    }
    clip.destroy();
  }

  function timesSpeedDecode(times) {
    let startTime = performance.now();
    

    const timer = setInterval(async () => {
      const { state, video } = await clip.tick(
        Math.round((performance.now() - startTime) * 1000) * times,
      );
      if (state === 'done') {
        clearInterval(timer);
        clip.destroy();
        return;
      }
      if (video != null && state === 'success') {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(
          video,
          0,
          0,
          video.codedWidth,
          video.codedHeight,
          0,
          0,
          ctx.canvas.width,
          ctx.canvas.height,
        );
        video.close();
      }
    }, 1000 / 30);

    stop = () => {
      clearInterval(timer);
      clip.destroy();
    };
  }
}

export default createUI(start);

// ---------- 以下是 UI 代码 ---------------

function createUI(start) {
  return () => {
    const [value, setValue] = useState('bunny.mp4');
    const [speed, setSpeed] = useState(Infinity);
    const [ctx, setCtx] = useState(null | undefined | CanvasRenderingContext2D);
    return (
      <div>
        
        <Button
          onClick={() => {
            start(speed, value , ctx);
          }}
        >
          启动！
        </Button>
        <br />
       

        <Radio.Group
          onChange={(e) => {
            setValue(e.target.value);
          }}
          value={value}
        >
          <button value="bunny.mp4">bunny.mp4</button>
          <Radio value="bear.mp4">bear.mp4</Radio>
        </Radio.Group>
        <Divider type="vertical"></Divider>{' '}
        <Radio.Group
          onChange={(e) => {
            setSpeed(e.target.value);
          }}
          value={speed}
        >
          <Radio value={Infinity}>最快</Radio>
          <Radio value={3}>3 倍速</Radio>
          <Radio value={1}>1 倍速</Radio>
        </Radio.Group>
        <br></br>
        <canvas
          width={600}
          height={333}
          ref={(c) => {
            setCtx(c?.getContext('2d') );
          }}
        />
      </div>
    );
  };
}
