import { MP4Clip,VisibleSprite,ImgClip,renderTxt2ImgBitmap } from "@webav/av-cliper";
import { create } from "zustand";

interface spriteStore{
    clip:  Map<string, MP4Clip>,
    setClip: (id:string,clip: MP4Clip) => void
    sprite: Map<string,VisibleSprite>
    setSprite: (id:string,sprite: VisibleSprite) => void
  }
  const useSpriteStore = create<spriteStore>((set) => ({
    setSprite(id, sprite) {
        set(state => {
            const newSpriteMap = new Map(state.sprite);
            newSpriteMap.set(id, sprite);
            return { sprite: newSpriteMap };
        })
    },
    sprite: new Map<string, VisibleSprite>(),
    clip: new Map<string, MP4Clip>(),
    setClip: (id: string, clip: MP4Clip) =>
      set((state) => {
        const newClipMap = new Map(state.clip);
        newClipMap.set(id, clip);
        return { clip: newClipMap };
      }),
  }));

  export default useSpriteStore;