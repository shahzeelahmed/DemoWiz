import { useState } from "react"

export default function Menu() {
    const [size,setSize] = useState(0);
    const [shadow,setShadow] = useState(0);
    const [roundness,setRoundeness] = useState(0);
    const changeSize = (e) => {
        setSize(parseInt(e.target.value,10))
        console.log(size)
    }
    const changeShadow = (e) => {
        setShadow(parseInt(e.target.value,10))
        console.log(size)
    }
    const changeRoundness = (e) => {
        setRoundeness(parseInt(e.target.value,10))
        console.log(size)
    }
    return(
        <div className="menu">
        <h1 className="style">Style</h1>
       <div>
       <h1 className="size">size</h1>
       <input className="sizerange" type="range" min={0} max={30} onChange={changeSize} step={1} value={size}>
       </input>
       </div>
       <div>
       <h2 className="roundness"> roundness</h2>
       <input className="paddingrange" type="range" min={0} max={30} onChange={changeRoundness} step={1} value={roundness}>
       </input>
       </div>
       <div>
        <h2 className="shadow">shadow</h2>
       <input className="shadowrange" type="range" min={0} max={30} onChange={changeShadow} step={1} value={shadow}>
       </input>
       </div>
        </div>
    )
}