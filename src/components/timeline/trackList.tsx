import React, { useCallback, useState } from "react"
import { DragData, TrackItem, TrackRow } from "../../types/types";

const TrackList: React.FC = () => { 
    const [isDragging,setIsDragging] = useState(false);
    //move to store later
    const [dragData, setDragData] = useState<DragData | null>(null);
    const [dragItemType, setDragItemType] = useState<TrackItem | null>(null);
    const [trackList,setTrackList] = useState<TrackItem[]>([]);
    const [currentRow,setCurrentRow] = useState<TrackRow >();
    const [Row, setRow] = useState<TrackRow[]>([]);
    const [dragElement, setDragElement] = useState<HTMLElement | null>(null);
    
    const  handleMouseDown = (event: React.MouseEvent ) => {
        const target = event.target as HTMLElement;
        setDragElement(target);
        event.stopPropagation();
        event.preventDefault();
        setIsDragging(true);
        setDragData({
          dataInfo: '' ,
          dragType: 'mouse-down',
          dragPoint: {
            x: event.pageX,
            y: event.pageY
          },
         
        });
        target.dataset.startX = (event.pageX - target.offsetLeft).toString();
        target.dataset.startY = (event.pageY - target.offsetTop).toString();
    }
    const handleMouseMove = useCallback((event: React.MouseEvent,item: TrackItem) => { 
        if (isDragging && dragElement) { 
            setDragData(  ({ 
                dataInfo:  item.id,
                dragType: 'mouse-move',
                dragPoint: {
                    x: event.pageX,
                    y: event.pageY
                },
            }));
        }
    }, [isDragging,dragElement]); 
    
    const handleMouseUp = useCallback(() => { 

        setIsDragging(false);
        setDragElement(null);
       
    },[]);

    return (
        <div/>
      );
}
export default TrackList;