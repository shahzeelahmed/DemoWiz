//[todo]: add split fn and text animations
import { TextClip } from "@/class/textTrack"
import { useAVCanvasStore } from "@/store/avCanvasStore"
import usePlayerStore from "@/store/playerStore"
import useSpriteStore from "@/store/spriteStore"
import { useTrackStateStore } from "@/store/trackStore"
import { TextConfig } from "@/types/textConfig"
import { loadFile } from "@/utils/helpers"
import { MP4Clip, VisibleSprite } from "@webav/av-cliper"
import { nanoid } from "nanoid"
import { TextTrack } from "@/types/trackType"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import fileIcon from '@/frappe-ui/icons/fileUpload.svg'
const addTextSprite = () => {
    const avCanvas = useAVCanvasStore(state=> state.avCanvas)
    const spriteMap = useSpriteStore(state=> state.sprite)
    const trackStore = useTrackStateStore()
    const currentTime = usePlayerStore(state=> state.currentTime)
    const index = useTrackStateStore(state => state.rowIndexCounter)
    const [textValue, setTextValue] = useState("");
const addSprite = async (content:string) => {
  const trackId = nanoid(5)
  const rowId = nanoid(5)
  
  const testConfig :TextConfig = {
    content: content,
    fontSize: 58,
    fontFamily: "Arial",
    fontStyle: "normal",
    animationType: "none",
    animationDuration: 3*1e6,
    fontWeight: 200,
    bold: false,
    italic: false,
    color: "#ffffff",
    showShadow: false,
    shadowColor: "#888888",
    shadowBlur: 5,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    shadowOpacity: 0.5,
    showStroke: false,
    strokeColor: "#000000",
    strokeWidth: 1,
    letterSpacing: 0,
    textDecoration: "none",
    animationSpeed: 0,
    verticalAlign: "top",
    bgColor: "",
    opacity: 1,
    x: 0,
    y: 0,
    width: 400,
    height: 400,
    lineSpacing: 0,
    align: "left",
    backgroundColor: "",
    backgroundOpacity: 0,
    borderColor: "",
    borderWidth: 0,
    borderRadius: 0,
    padding: 0,
    margin: 0,
    strokeOpacity: 0,
    strokeDasharray: [],
    strokeDashoffset: 0,

  };
    const itemToAdd: TextTrack[] = [{
      id: trackId,
      name: 'test',
      type: 'TEXT',
      duration: 5,
      inRowId: rowId,
      startTime: currentTime,
      endTime: currentTime + 5,
      config: testConfig
    }]

    trackStore.addRow({ id: rowId, acceptsType: 'TEXT', trackItem: itemToAdd })
    trackStore.addTrack(itemToAdd)

    const clip = new TextClip(itemToAdd[0].config)
    const spr = new VisibleSprite(clip)
    spr.time.offset = currentTime * 1e6
    spr.time.duration = 5 * 1e6
   
    
    // spr.setAnimation(
    //   {
    //     '0%': { x: 400, y: 200 },
    //     '25%': { x: 400, y: 220 },
    //     '50%': { x: 400, y: 230 },
    //     '75%': { x: 400, y: 240  },
    //     '100%': { x: 400, y: 300 },
    //   },
    //   { duration: 1e6, iterCount: 1 },
    // );
    spriteMap.set(itemToAdd[0].id, spr)
    spr.rect.fixedScaleCenter = true
    spr.rect.fixedAspectRatio = true
    avCanvas!.addSprite(spr)
    console.log('index',index)
    

  
  }

return (

    <div className="flex flex-col gap-2">
      <textarea
        className="border rounded-md p-2 w-full bg-[#f6f6f6] min-h-2 mt-2 text-[#5e5e5e] "
        placeholder="Enter Text Here..."
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
      />
      <Button
        className="mt-2"
        onClick={async () => {
          await addSprite(textValue);
        }}
      >
        ADD TEXT
      </Button>
    </div>  
)
}
export default addTextSprite