import { AudioTrack, VideoTrack, ImageTrack } from '../../types/trackType'
import { TrackRow } from '../../types/trackRowTypes'
import { useTrackStateStore } from '../../store/trackStore'
import React from 'react'
const mockTrackLines: TrackRow[] = [
  {
    id: 'string',
    type: 'MEDIA',
    index: 0,
    acceptsType: 'VIDEO',

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
        }
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
        }
      }
    ]
  }
]

const TrackList = () => {
  const { addTrack, tracks } = useTrackStateStore()
  const mock = mockTrackLines[0].trackItem[0] as VideoTrack

  return (
    <>
      <div
        className='h-16 w-24 bg-black flex flex-col place-content-around'
        onClick={() => {
          addTrack(mock, 'test1', 'VIDEO'),
            console.log(tracks.map(tracks => tracks.name))
        }}
      ></div>
      <div className='h-10 w-20 bg-slate-400'>
        <p color='red'>
          {tracks === null ? 'no track' : tracks.map(tracks => tracks.name)}
        </p>
      </div>
    </>
  )
}

export default TrackList

const mockVideoTrack = (id: string): VideoTrack => ({
  id,
  name: 'video2',
  isMuted: false,
  isVisible: true,
  index: 0,
  type: 'video',
  duration: Math.floor(Math.random() * 60) + 10,
  height: 1080,
  width: 1920,
  format: 'mp4',
  volume: 1,
  fps: 30,
  position: {
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100)
  },
  transform: {
    scaleX: 1,
    scaleY: 1,
    rotation: 0
  }
})

const mockImageTrack = (id: string): ImageTrack => ({
  id,
  type: 'image',
  name: 'png1',
  isVisible: true,
  duration: 100,
  index: 0,
  height: 800,
  width: 600,
  format: 'png',
  position: {
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100)
  },
  transform: {
    scaleX: 1,
    scaleY: 1,
    rotation: 0
  }
})

const mockAudioTrack = (id: string): AudioTrack => ({
  id,
  name: 'audio1',
  type: 'audio',
  index: 0,
  duration: Math.floor(Math.random() * 60) + 10,
  volume: 0.8,
  format: 'mp3'
})

export const mockTrackRows: TrackRow[] = [
  {
    id: 'row-1',
    acceptsType: 'VIDEO',
    index: 0,
    type: 'MEDIA',
    trackItem: [mockVideoTrack('video-1'), mockVideoTrack('video-2')]
  },
  {
    id: 'row-2',

    acceptsType: 'IMAGE',
    type: 'MEDIA',
    index: 1,
    trackItem: [
      mockImageTrack('image-1'),
      mockImageTrack('image-2'),
      mockImageTrack('image-3')
    ]
  },
  {
    id: 'row-3',
    acceptsType: 'AUDIO',
    type: 'MEDIA',
    index: 2,
    trackItem: [mockAudioTrack('audio-1'), mockAudioTrack('audio-2')]
  }
]
