import { create } from 'zustand'

import { BaseTrack, TrackItemType } from '../types/trackType'
import { TrackRow, TrackRowType } from '../types/trackRowTypes'

//[todo]: add condition for checking overlap b/w tracks
interface TrackRowState {
  trackLines: TrackRow[]
  tracks: TrackItemType[]
  addTrack: (track: TrackItemType, id: string,type:TrackRowType) => void
  removetrack: (id: any) => void
}

export const useTrackStateStore = create<TrackRowState>(set => ({
  trackLines: [],
  tracks: [],
  addTrack: (track, id,type) =>
    set(state => {
      const addtrack = state.trackLines.map(row => {
        if (row.id === id && row.acceptsType === type) {
          return {
            ...row,
            trackItem: [...row.trackItem, track]
          }
        }
        return {
          addtrack,
          tracks: [...state.tracks, track]
        }
      })
      return {
        trackLines: addtrack
      }
    }),
  removetrack: (trackId: string) =>
    set(state => {
      const removetrack = state.trackLines.map(items => ({
        ...items,
        trackItem: items.trackItem.filter(track => track.id === trackId)
      }))
      return {
        trackLines: removetrack,
        tracks: state.tracks.filter(item => item.id === trackId)
      }
    })
}))
