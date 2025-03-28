import { create } from 'zustand'
import { BaseTrack, TrackItemType, TrackType } from '../types/trackType'
import { TrackRow, TrackRowType } from '../types/trackRowTypes'
import { getGridPixel } from '../utils/utils'

//[todo]: add condition for checking overlap b/w tracks
interface TrackRowState {
  trackLines: TrackRow[]
  tracks: TrackItemType[]
  frameCount: number
  selectedTrackId: string | null
  addTrack: (tracks: TrackItemType[]) => void
  addRow: (row: TrackRow) => void
  updateTrack: (updatedTrack: TrackItemType[]) => void
  removetrack: (trackId: string, rowId: string) => void
  removeRow: (rowId: string) => void
  selectTrack: (trackId: string) => void
}

export const useTrackStateStore = create<TrackRowState>(set => ({
  trackLines: [],
  frameCount: 0,
  tracks: [],
  selectedTrackId: null,
  addTrack: (tracks: TrackItemType[]) =>
    set(state => ({
      
      tracks: [...state.tracks, ...tracks], 
      trackLines: state.trackLines.map(row => ({
        ...row,
        trackItem: row.trackItem ? [...row.trackItem, ...tracks] : [...tracks],
      })),
    })),
  updateTrack: (updatedTracks: TrackItemType[]) =>
    set(state => ({
      tracks: state.tracks.map(track => {
        const updatedTrack = updatedTracks.find(t => t.id === track.id)
        return updatedTrack ? { ...track, ...updatedTrack } : track
      }),
      trackLines: state.trackLines.map(row => ({
        ...row,
        trackItem: row.trackItem.map(track => {
          const updatedTrack = updatedTracks.find(t => t.id === track.id)
          return updatedTrack ? { ...track, ...updatedTrack } : track
        })
      }))
    })),
  addRow (row) {
    set(state => {
      return {
        trackLines: [...state.trackLines, row]
      }
    })
  },
  removeRow (rowId) {
    set(state => {
      return {
        tracks: state.tracks.filter(track => track.inRowId !== rowId),
        trackLines: state.trackLines.filter(row => row.id !== rowId)
      }
    })
  },

     selectTrack: trackid =>
      set(state =>
        state.selectedTrackId === trackid
          ? { selectedTrackId: null }
          : { selectedTrackId: trackid }
      ),
  removetrack: (trackId: string, rowId: string) =>
    set(state => {
      const removeTrack = state.trackLines.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            trackItem: row.trackItem.filter(track => track.id !== trackId)
          }
        }
        return row
      })
      return {
        trackLines: removeTrack,
        tracks: state.tracks.filter(item => item.id !== trackId)
      }
    })
}))
