import { MediaAsset, tracksType } from "./trackType"

export interface TrackRow {
    id: string
    index: number
    acceptsType: tracksType
    itemIndex: number
    trackItem: MediaAsset
  }
  export interface TrackRowItem{
      id: string,
      isVisible: boolean
      trackWidth: number
      index:number
  }
  