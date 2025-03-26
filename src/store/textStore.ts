// textStore to modify textconfig
import {create} from "zustand";
import { TextClip } from "@/class/textTrack" 
import { TextConfig } from "@/types/textConfig";

interface TextStore {
    clips: Map<string, TextClip>;
    addClip: (id: string, clip: TextClip) => void;
    changeFirstClipContent: (newContent: string) => void;
    changeOpacity: (opacity:number) =>void
  }
  
  export const useTextStore = create<TextStore>((set, get) => ({
    clips: new Map(),
  
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
        clip.tick(0);
      } else {
        console.warn("No clip found in the store to update.");
      }
    },
    changeOpacity:(opacity:number)=> {
        const {clips} =get()
        const firstKey = Array.from(clips.keys())[0];
        if (firstKey) {
            const clip = clips.get(firstKey)!;
            clip.textConfig.letterSpacing = opacity;
            clip.updateContent('test-new')
            clip.tick(0);
          } else {
            console.warn("no clip");
          }
    },
  }));