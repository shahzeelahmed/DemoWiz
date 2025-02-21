import { MediaAsset, tracksType } from "./trackType"
import { TrackItem } from "./types"

export interface TrackRow {
    id: string
    index: number
    acceptsType: tracksType
    itemIndex: number
    trackItem: TrackItem
  }
  export interface TrackRowItem{
      id: string,
      isVisible: boolean
      trackWidth: number
      index:number
  }
  