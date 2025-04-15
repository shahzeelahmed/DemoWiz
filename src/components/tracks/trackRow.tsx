import React from "react";
import { useTrackStateStore } from "../../store/trackStore";
import { nanoid } from "nanoid";
import { TrackRow } from "../../types/trackRowTypes";
import { TrackItemType } from "../../types/trackType";


  const TRACK_ROW_TYPES = {
    MEDIA: 'media',
    NON_MEDIA: 'non-media'
  };
const trackRow = React.memo(() =>{
    const store = useTrackStateStore()
    const rows = store.trackLines
    const addTrackRow = (row: TrackRow) => {
    
          store.addRow(row);
      };
      const removeRow = (rowId: string) =>{
        store.removeRow(rowId)
      }
    return (
        <div className="flex flex-col">
            {rows.map((row)=> {
                return(
                    <div id={row.id} accepts-type={row.acceptsType}>

                    </div>
                )
            })}
        </div>

    )
}
export default trackRow;