import { MP4Clip } from '@webav/av-cliper';
(async () => {
  const resp1 = await fetch('src/assets/JOTARO VS KIRA 4K 60 FPS MhL_V19Su7o.mp4');
  const clip = new MP4Clip(resp1.body!);
  await clip.ready;
  let time = 0;
  while (true) {
    const { state, video, audio } = await clip.tick(time);
    console.log('worker decode', { time, video, audio, state });
    if (state === 'done') break;
    if (video != null && state === 'success') {
      video.close();
    }
    time += 33000;
  }
  clip.destroy();
})();