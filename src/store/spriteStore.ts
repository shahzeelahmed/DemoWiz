import { MP4Clip,VisibleSprite,ImgClip,renderTxt2ImgBitmap } from "@webav/av-cliper";
import { create } from "zustand";

interface spriteStore{
    clip:  Map<string, MP4Clip>,
    setClip: (id:string,clip: MP4Clip) => void
    sprite: Map<string,VisibleSprite>
    setSprite: (id:string,sprite: VisibleSprite) => void
    selectedSprite : VisibleSprite | null
    getSpriteById : (id: string)=>void
    setSelectedSprite: (spr:VisibleSprite) =>void
  }
  const useSpriteStore = create<spriteStore>(set => ({
    clip: new Map(),
    sprite: new Map(),
    selectedSprite: null,
  
    setClip: (id, clip) =>
      set(state => {
        const newClipMap = new Map(state.clip);
        newClipMap.set(id, clip);
        return { clip: newClipMap };
      }),
  
    setSprite: (id, sprite) =>
      set(state => {
        const newSpriteMap = new Map(state.sprite);
        newSpriteMap.set(id, sprite);
        return { sprite: newSpriteMap };
      }),
  
    getSpriteById: id =>
      set(state => {
        const spr = state.sprite.get(id);
        if (spr === undefined) {
          return { selectedSprite: null };
        } else {
          return { selectedSprite: spr };
        }
      }),
  
    setSelectedSprite: (spr) =>
      set({ selectedSprite: spr }),
  }));

  export default useSpriteStore;