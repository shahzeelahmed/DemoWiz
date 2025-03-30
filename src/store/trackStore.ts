import { create } from 'zustand'
import { BaseTrack, TrackItemType, TrackType } from '../types/trackType'
import { TrackRow, TrackRowType } from '../types/trackRowTypes'
import { getGridPixel } from '../utils/utils'
import trackRow from '@/components/tracks/trackRow'

//[todo]: add condition for checking overlap b/w tracks
interface TrackRowState {
  trackLines: TrackRow[]
  tracks: TrackItemType[]
  frameCount: number
  selectedTrackItem: TrackItemType | null
  selectedTrackId: string | null
  setSelectedTrackItem: (id:string) =>void;
  addTrack: (tracks: TrackItemType[]) => void
  addRow: (row: TrackRow) => void
  updateTrack: (updatedTrack: TrackItemType[]) => void
  removetrack: (trackId: string) => void
  removeRow: (rowId: string) => void
  selectTrack: (trackId: string) => void
  rowIndexCounter: number;
}

export const useTrackStateStore = create<TrackRowState>(set => ({
  trackLines: [],
  frameCount: 0,
  rowIndexCounter:0,
  selectedTrackItem: null,
  tracks: [],
  selectedTrackId: null,
  setSelectedTrackItem: (id: string) =>
    set(state => ({
      selectedTrackItem: state.tracks.find(track => track.id === id) || null, 
    })),
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
     addRow(row: Omit<TrackRow, 'index'>) {
      set((state: TrackRowState) => ({
        trackLines: [...state.trackLines, { ...row, index: state.rowIndexCounter }],
        rowIndexCounter: state.rowIndexCounter + 1,
      }));
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
      removetrack: (trackId: string) =>
        set(state => ({
          trackLines: state.trackLines.map(row => ({
            ...row,
            trackItem: row.trackItem.filter(track => track.id !== trackId)
          })),
          tracks: state.tracks.filter(item => item.id !== trackId)
        }))
  
}))
