import React, { useEffect, useState } from 'react'
import './App.css'
import Timeline from './components/timeline/timeLine'
import Playhead from './components/timeline/playhead'

import {DndContext} from '@dnd-kit/core'
import TrackList from './components/tracks/trackList'
export default function App () {
  return (
    <TrackList/>
  )
}
