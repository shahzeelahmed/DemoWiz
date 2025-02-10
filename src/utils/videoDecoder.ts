import { MP4Clip } from "@webav/av-cliper";

export class VideoDecoder {
  private clip: MP4Clip | null = null;

  async loadVideo(source: ReadableStream<Uint8Array>) {
    this.clip = new MP4Clip(source);
    await this.clip.ready;
    return this.clip.meta;
  }

 
}