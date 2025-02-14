import React, { useEffect, useState } from 'react'
import './App.css'
import Timeline from './components/timeline/timeLine'
import Playhead from './components/timeline/playhead'
import TrackList from './components/timeline/trackList'
export default function App () {
  return (
    <div>
      <TrackList/>
      {/* <Playhead
        trackScale={60}
        frameCount={1000}
        initialPlayStartFrame={0}
        offsetLeft={10}
      />
      <Timeline
        start={0}
        scale={60}
        focusPosition={{ start: 0, end: 100 }}
        isDark={false}
      /> */}
    </div>
  )
}
