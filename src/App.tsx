import React from "react";
import "./App.css";
import Timeline from "./components/timeline/timeLine";
export default function App() {


  return (  
<Timeline  start={0}
    
      scale={30}
      focusPosition={{ start: 0, end: 100 }}
      isDark={false}
      onSelectFrame={(frame) => console.log(`Selected frame: ${frame}`)}/>
  )
 
}




