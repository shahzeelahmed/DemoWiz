// textStore to modify textconfig
//return clip.tick(0) promise
import {create} from "zustand";
import { TextClip } from "@/class/textTrack" 
import { TextConfig } from "@/types/textConfig";

interface TextStore {
    clips: Map<string, TextClip>;
    addClip: (id: string, clip: TextClip) => void;
    changeFirstClipContent: (newContent: string) => void;
    changeOpacity:  (opacity:number) => void
    opacity: number,
    spacing:number,

  }
  
  export const useTextStore = create<TextStore>((set, get) => ({
    clips: new Map(),
    opacity: 1,
    spacing: 0,
  
  changeOpacity: (spacing:number)=> {
    set({spacing})
    const {clips} =get()
    const firstKey = Array.from(clips.keys())[0];
    if (firstKey) {
        const clip = clips.get(firstKey)!;
        clip.textConfig.letterSpacing = spacing
    }
},
    addClip: (id: string, clip: TextClip) => {
      const newClips = new Map(get().clips);

      newClips.set(id, clip);
      set({ clips: newClips });
      console.log(`Clip with id ${id} added.`);
    },
  
    changeFirstClipContent: (newContent: string) => {
      const { clips } = get();
      const firstKey = Array.from(clips.keys())[0];
      if (firstKey) {
        const clip = clips.get(firstKey)!;
        
        clip.updateContent(newContent);
        
     
      } 
    },

   
  }));
