

import { ImageClip } from "@/class/imageTrack"
import { VideoSprite } from "@/class/videoSprite"
import { Button } from "@/components/ui/button"
import { useAVCanvasStore } from "@/store/avCanvasStore"
import usePlayerStore from "@/store/playerStore"
import useSpriteStore from "@/store/spriteStore" 
import { useTrackStateStore } from "@/store/trackStore"
import { ImageConfig } from "@/types/imageConfig"
import { EffectTrack } from "@/types/trackType"
import { loadImage } from "@/utils/helpers"
import type { VisibleSprite } from '@webav/av-cliper'
import { nanoid } from "nanoid"

import React, { useState } from "react"

const AddEffect = () => {
  const trackId = useTrackStateStore(state=>state.selectedTrackId)
  const trackStore = useTrackStateStore()
  const currentTime = usePlayerStore(state=> state.currentTime)

  type Region =
    | 'top-left' | 'top-center' | 'top-right'
    | 'center-left' | 'center' | 'center-right'
    | 'bottom-left' | 'bottom-center' | 'bottom-right'

  const [showPicker, setShowPicker] = useState(false)

  const addEffectToClip = (
    startTime: number,
    hold: number,
    region: Region
  ) => {
    const { sprite, setSprite } = useSpriteStore.getState();
    if (!trackId) return 
    const spr = sprite.get(trackId);
    if (!(spr instanceof VideoSprite)) {
     
      return;
    }
    const videoSpr = spr as VideoSprite;
    //region index
    const regions: Region[] = [
      'top-left','top-center','top-right',
      'center-left','center','center-right',
      'bottom-left','bottom-center','bottom-right'
    ];
    const idx = regions.indexOf(region);
    const endTime = startTime + hold;
    //video params in microsec
    videoSpr.setZoomParameters(
      startTime *1e3,
      endTime *1e3 ,
      hold *1e3,
      idx
    );
    //update store so renderer picks up change
    setSprite(trackId, videoSpr  as VisibleSprite)
    //add effect to existing track row
    const store = useTrackStateStore.getState()
    const row = store.trackLines.find(r => r.trackItem.some(i => i.id === trackId))
    if (row) {
      const effectId = nanoid()
      const effect: EffectTrack = {
        id: effectId,
        name: `zoom:${effectId}`,
        type: 'EFFECT',
        isVisible: true,
        effectType: 'ZOOM',
        startTime:startTime/1e3,
        endTime:endTime/1e3,
        duration: (startTime + endTime)/1e3,
        positionIndex: idx,
        inRowId: row.id
      }
      store.addTrack([effect])
      const unsub = useTrackStateStore.subscribe((state) => {
        const et = state.tracks.find(t => t.id === effectId) as EffectTrack 
        if (et?.startTime != null && et.endTime != null) {
          const holdMicro = Math.round((et.endTime - et.startTime) * 1e6)
          videoSpr.setZoomParameters(
            Math.round(et.startTime * 1e6),
            Math.round(et.endTime * 1e6),
            holdMicro,
            idx
          )
          setSprite(trackId, videoSpr as VisibleSprite)
        }
      }
    )
    }
  };

  const popoverKeyframes = `
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `

  return (
   
    <>
  {!trackId ? (
    <h3 className="text-sm text-red-700 mt-2">select a video clip to apply effect</h3>
  ) : (
    <>
      <style>{popoverKeyframes}</style>
      <div className="relative inline-block">
        <Button
          variant="outline"
          className="border rounded-md p-2 w-full bg-[#e9e9e9] text-gray-700 mt-2 h-14"
          onClick={() => setShowPicker(v => !v)}
        >
          <h3 className="text-sm self-center text-[#9e9e9e]">Zoom Effect</h3>
        </Button>
        {showPicker && (
          <div
            className="absolute z-20 bg-white/80 backdrop-blur-sm p-5 border border-gray-200 rounded-lg shadow-2xl grid grid-cols-3 gap-3 mt-1 w-64"
            style={{ animation: 'zoomIn 0.2s ease-out forwards' }}
          >
            <div className="col-span-3 text-center font-sm text-[#4e4e4e] mb-2">
              Select area you want to zoom
            </div>
            {([
              'top-left','top-center','top-right',
              'center-left','center','center-right',
              'bottom-left','bottom-center','bottom-right'
            ] as Region[]).map(region => {
              const alignMap: Record<Region, string> = {
                'top-left': 'items-start justify-start',
                'top-center': 'items-start justify-center',
                'top-right': 'items-start justify-end',
                'center-left': 'items-center justify-start',
                'center': 'items-center justify-center',
                'center-right': 'items-center justify-end',
                'bottom-left': 'items-end justify-start',
                'bottom-center': 'items-end justify-center',
                'bottom-right': 'items-end justify-end'
              }
              return (
                <button
                  key={region}
                  aria-label={`Zoom ${region.replace('-', ' ')}`}
                  className={`w-12 h-12 border-2 flex ${alignMap[region]} hover:border-[#6e6e6e]`}
                  onClick={() => { addEffectToClip(currentTime, 5000, region); setShowPicker(false); }}
                >
                  <span className="block w-3 h-3 bg-[#6e6e6e] rounded-full" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )}
</>

  )

  
  }


export default AddEffect