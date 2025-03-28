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
import React from "react"
import fileIcon from '@/frappe-ui/icons/fileUpload.svg'
const addTextSprite = () => {
    const avCanvas = useAVCanvasStore(state=> state.avCanvas)
    const spriteMap = useSpriteStore(state=> state.sprite)
    const trackStore = useTrackStateStore()
    const currentTime = usePlayerStore(state=> state.currentTime)
    

const addSprite = async (config: TextConfig) => {
    const testTextConfig: TextConfig = {
      content: config.content,
      fontSize: config.fontSize,
      fontFamily: config.fontFamily,
      fontStyle: config.fontStyle,
      textDecoration: 'none',
      fontWeight: config.fontWeight,
      bold: config.bold,
      italic: config.italic,
      color: config.color,
      bgColor: '',
      opacity: 1,
      x: 0,
      y: 0,
      width: 400,
      height: 200,
      lineSpacing: 10,
      letterSpacing: 0,
      align: 'left',
      backgroundColor: '',
      backgroundOpacity: 1,
      borderColor: '#ffffff',
      borderWidth: 2,
      borderRadius: 4,
      padding: 4,
      margin: 0,
      showShadow: config.showShadow || false,
      shadowColor: config.shadowColor || '#FFFFFF',
      shadowBlur: config.shadowBlur,
      shadowOffsetX: config.shadowOffsetX,
      shadowOffsetY: config.shadowOffsetY,
      shadowOpacity: config.shadowOpacity,
      showStroke: config.showStroke,
      strokeColor: config.strokeColor,
      strokeWidth: config.strokeWidth,
      strokeOpacity: 1,
      strokeDasharray: [],
      strokeDashoffset: 0,
      verticalAlign: 'top',
      animationSpeed: 10
    }
    const id = nanoid(5)
    const itemToAdd: TextTrack = {
      id: id,
      type: 'TEXT',
      name: 'test',
      duration: 5,
      startTime: 0,
      endTime: 5,
      config: testTextConfig
    }

    trackStore.addRow({
      id: nanoid(5),
      acceptsType: 'TEXT',
      trackItem: [itemToAdd]
    })
    trackStore.addTrack([itemToAdd])
    const clip = new TextClip(itemToAdd.config)

    const spr = new VisibleSprite(clip)

    spriteMap.set(itemToAdd.id, spr)
    // spr.rect.fixedScaleCenter = true
    // spr.rect.fixedAspectRatio = true

    avCanvas!.addSprite(spr)

    

  
  }
const testConfig :TextConfig = {
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    fontSize: 36,
    fontFamily: "Arial",
    fontStyle: "normal",
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
    showStroke: true,
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
    width: 0,
    height: 0,
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
    strokeDashoffset: 0
};
return (
    <Button  className="mt-2" onClick={async() =>{await addSprite(testConfig)}}>
        ADD TEXT
        </Button>
   
)
}
export default addTextSprite