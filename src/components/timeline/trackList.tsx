import React, { useState } from "react"
import { DragData, TrackItem, TrackRow } from "../../types/types";

const TrackList: React.FC = () => { 
    const [isDragging,setIsDragging] = useState(false);
    //move to store later
    const [dragData, setDragData] = useState<DragData>();
    const [dragItemType, setDragItemType] = useState<TrackItem>();
    const [trackList,setTrackList] = useState<TrackItem[]>([]);
    const [currentRow,setCurrentRow] = useState<TrackRow>();
    const [Row, setRow] = useState<TrackRow[]>([]);
    return (
        <div/>
      );
}
export default TrackList;