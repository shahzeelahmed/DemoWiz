import { MediaAsset, TrackItemType, tracksType } from './trackType'


export interface TrackRowList {
  id: string
  rows: TrackRow[]
}
export type TrackRowType = "MEDIA" | "TRANSITION" | "EFFECT" | "TEXT"
export interface TrackRow {
    
  id: string
  type: TrackRowType
  index: number
  acceptsType: TrackItemType
  itemIndex: number
  trackItem: TrackItemType[]
}
export interface TrackRowItem {
  id: string
  isVisible: boolean
  trackWidth: number
  index: number
}
