import { create } from 'zustand'
import { BaseTrack, TrackItemType, TrackType } from '../types/trackType'
import { TrackRow, TrackRowType } from '../types/trackRowTypes'
import { getGridPixel } from '../utils/utils'

//[todo]: add condition for checking overlap b/w tracks
interface TrackRowState {
  trackLines: TrackRow[]
  tracks: TrackItemType[]
  frameCount: number
  selectedRowId: string | null
  addTrack: (tracks: TrackItemType[]) => void
  addRow: (row: TrackRow) => void
  updateTrack: (updatedTrack: TrackItemType[]) => void
  removetrack: (trackId: string, rowId: string) => void
  removeRow: (rowId: string) => void
  selectRow: (rowId: string) => void
}

export const useTrackStateStore = create<TrackRowState>(set => ({
  trackLines: [],
  selectedRowId: null,
  frameCount: 0,
  tracks: [],
  addTrack: (tracks: TrackItemType[]) =>
    set(state => ({
      tracks: [...state.tracks, ...tracks],
      trackLines: state.trackLines.map(row => ({
        ...row,
        trackItem: [...row.trackItem, ...tracks]
      }))
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
  selectRow: rowId =>
    set(state =>
      state.selectedRowId === rowId
        ? { selectedRowId: null }
        : { selectedRowId: rowId }
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
