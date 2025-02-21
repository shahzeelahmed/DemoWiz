import { create } from 'zustand'
import { TrackItem } from '../types/types'

interface TrackState {
  tracks: TrackItem[]
  addTrack: (tracks: TrackItem[]) => void
}

export const useTrackStateStore = create<TrackState>(set => ({
  tracks: [],
  addTrack: (tracks: TrackItem[]) => set({ tracks })
}))
