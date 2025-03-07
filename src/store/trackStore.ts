import { create } from 'zustand'
import { BaseTrack, TrackItemType, tracksType } from '../types/trackType'
import { TrackRow, TrackRowType } from '../types/trackRowTypes'
import { getGridPixel } from '../utils/utils'

//[todo]: add condition for checking overlap b/w tracks
interface TrackRowState {
  trackLines: TrackRow[]
  tracks: TrackItemType[]
  gridPixels: number
  frameCount: number
  addTrack: (track: TrackItemType, id: string, type: tracksType) => void
  addRow: (row:TrackRow) => void
  removetrack: (trackId: string, rowId: string) => void
  removeRow: (rowId: string) => void

}

export const useTrackStateStore = create<TrackRowState>(set => ({
  trackLines: [],
  gridPixels: getGridPixel(60, 100),
  frameCount: 0,
  tracks: [],
  addTrack: (track: TrackItemType, id: string, type: tracksType) =>
    set(state => {
      const addtrack = state.trackLines.map(row => {
        if (row.id === id && row.acceptsType === type) {
          console.log('track added')
          return {
            ...row,
            // trackItem: [...row.trackItem, track]
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
addRow(row) {
  set(state => {
    return {
      trackLines: [...state.trackLines, row]
    }
  })
},
removeRow(rowId) {
  set(state => {
    return {
      trackLines: state.trackLines.filter(row => row.id !== rowId)
    }
  })
},
  removetrack: (trackId: string, rowId: string) =>
    set(state => {
      const removeTrack = state.trackLines.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            // trackItem: row.trackItem.filter(track => track.id !== trackId)
          }
        }
        return row
      })
      return {
        trackLines: removeTrack,
        tracks: state.tracks.filter(item => item.id !== trackId)
      }
    }),
   
})

)
