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
        name: 'test',
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
        transform: {
          scaleX: 10,
          scaleY: 0,
          rotation: 0
        }
      }
    ]
  }
]

const TrackList = () => {
  const { tracks, trackLines } = useTrackStateStore()

  return (
    <div>
      {trackLines.map(item => (
        <div key={item.id}>
          <p>{item.id}</p>
        </div>
      ))}
    </div>
  )
}

export default TrackList
