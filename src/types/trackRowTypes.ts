import { MediaAsset, TrackItemType, TrackType } from './trackType'


export interface TrackRowList {
  id: string
  rows: TrackRow[]
}
export type TrackRowType = "MEDIA" | "TRANSITION" | "EFFECT" | "TEXT"
export interface TrackRow {
    
  id: string
  acceptsType: TrackRowType
  trackItem : TrackItemType[]
  index?: number

}
export interface TrackRowItem {
  id: string
  isVisible: boolean
  trackWidth: number
  index: number
}
