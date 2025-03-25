import { MP4Clip } from "@webav/av-cliper";
import { create } from "zustand";
interface VideoStore{
    clip:  Map<string, MP4Clip>,
    setClip: (id:string,clip: MP4Clip) => void
  }
  const useVideoStore = create<VideoStore>((set) => ({
    clip: new Map<string, MP4Clip>(),
    setClip: (id: string, clip: MP4Clip) =>
      set((state) => {
        const newClipMap = new Map(state.clip);
        newClipMap.set(id, clip);
        return { clip: newClipMap };
      }),
  }));

  export default useVideoStore;