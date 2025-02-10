import { MP4Clip } from "@webav/av-cliper";

export class VideoDecoder {
    private clip: MP4Clip |null = null;
    mp4Dur: Number | null = 0;
    decoderMap = new Map<string, MP4Clip>();

  async loadVideo(source: ReadableStream<Uint8Array>) {
    
    this.clip = new MP4Clip(source);
    await this.clip.ready;
    this.mp4Dur = Math.round(this.clip.meta.duration / 1e6);;
    return this.clip.meta;
  }
 
}