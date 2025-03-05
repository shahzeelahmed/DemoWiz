import React from "react"
interface TrackItemProps {
    width: number,
    color?: string,

}
//[to:do] add thumbnail to trackitem
export const TrackItem = (props: TrackItemProps) => {
    const getRandomColor = Math.floor(Math.random()*16777215).toString(16).toUpperCase();
  
    
   
    return (
        <div style={
           {
            backgroundColor: props.color
           }
        } className="h-10 w-[${props.width}px] bg-[color] mt-10 ">
            
        </div>
    )
}