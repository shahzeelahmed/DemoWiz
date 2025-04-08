import { IClip } from "@webav/av-cliper";
class VideoEffects implements  IClip{
    tick: (time: number) => Promise<{ video?: VideoFrame | ImageBitmap | null; audio?: Float32Array[]; state: "done" | "success"; }>;
    ready: Promise<IClipMeta>;
    meta: IClipMeta;
    clone: () => Promise<this>;
    split?: ((time: number) => Promise<[this, this]>) | undefined;
    destroy: () => void;

}