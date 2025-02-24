import React from 'react'
import { useTrackStateStore } from '../../store/trackStore'
import { TrackRow } from '../../types/trackRowTypes'
import { tracksType, VideoTrack } from '../../types/trackType'

const mockTrackLines: TrackRow[] = [
  {
    id: 'string',
    type: 'MEDIA',
    index: 0,
    acceptsType: 'VIDEO',
    itemIndex: 0,
    trackItem: [
      {
        name: 'test1',
        index: 0,
        isVisible: true,
        isMuted: false,
        id: 'test1',
        duration: 100,
        height: 20,
        width: 20,
        format: 'mp4',
        volume: 1,
        fps: 30,
        position: {
          x: 10,
          y: 10
        },
      },
      {
        name: 'test2',
        index: 0,
        isVisible: true,
        isMuted: false,
        id: 'test1',
        duration: 200,
        height: 20,
        width: 20,
        format: 'mp4',
        volume: 1,
        fps: 30,
        position: {
          x: 10,
          y: 10
        },
      }
    ]
  }
]

const TrackList = () => {
  const { tracks, trackLines } = useTrackStateStore()
  const videoTrack = mockTrackLines;

  return (
    <div>
      {videoTrack.map(item => (
        <div key={item.id}>
          <p>{item.id}</p>
          <p>{item.trackItem.map((item) => item.name)}</p>
        </div>
      ))}
    </div>
  )
}

export default TrackList
