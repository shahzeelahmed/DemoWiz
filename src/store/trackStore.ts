import { useState, useMemo, useEffect } from "react";
import { TrackLineItem, TrackItem } from "../types/types";


export const useTrackState = () => {
    const [dragData, setDragData] = useState({
        dataInfo: '',
        dragType: '',
        dragPoint: {
          x: 0,
          y: 0
        }
      });
    
      const [moveTrackData, setMoveTrackData] = useState({
        lineIndex: -1,
        itemIndex: -1
      });
    
      const [trackScale, setTrackScale] = useState(() => 
        parseInt(localStorage.getItem('trackS') || '60')
      );

  
    const [trackList, setTrackList] = useState<TrackLineItem[]>(() => {
      const stored = localStorage.getItem('trackList');
      return stored ? JSON.parse(stored) : [];
    });
  
    const [selectTrackItem, setSelectTrackItem] = useState({
      line: -1,
      index: -1
    });
  
    const selectResource = useMemo(() => {
      if (selectTrackItem.line === -1) {
        return null;
      }
      return trackList[selectTrackItem.line]?.list[selectTrackItem.index] || null;
    }, [selectTrackItem, trackList]);
  
  
  
    return {
      selectTrackItem,
      selectResource,
      trackList,
    };
  };