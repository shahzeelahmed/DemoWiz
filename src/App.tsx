import './App.css'
import React, { useState } from 'react'
import TrackList from './components/tracks/trackList'
import DraggableTrack from './components/tracks/draggable'
import TimeLine from './components/timeline/timeLine'


export default function App () {

  const [currentTime, setCurrentTime] = useState(0)
   const [zoom, setZoom] = useState(1)
 
   const handleTimeUpdate = (newTime: number) => {
     setCurrentTime(newTime)
     console.log('time:', newTime)
   }
 
   return (
     
     <div style={{ width: '100%', overflowX: 'auto' }}>
       <h1>Time Ruler Demo</h1>
       <h1>{zoom}</h1>
       <TimeLine
         duration={18000}
         zoom={zoom}
         onTimeUpdate={handleTimeUpdate}
         currentTime={currentTime}
         onScroll={scrollValue => console.log('Scrolled:', scrollValue)}
       />
 
       <div>
         <button onClick={() => setZoom(zoom + 0.1)}>Zoom In</button>
         <button
           onClick={() => setZoom(Math.max(0.20000000000000004, zoom - 0.1))}
         >
           Zoom Out
         </button>
       </div>
       <DraggableTrack/>
     </div>
   )
}
