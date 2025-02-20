import { DragEndEvent, UniqueIdentifier, useDroppable } from "@dnd-kit/core"
import { generateId } from "../utils/helpers"
import { BaseTrackItem,acceptableDrops } from "../types/types"
import { useState } from "react"

const useDrop = (props: BaseTrackItem) =>{
    const [parent, setParent] = useState<UniqueIdentifier | null>(null);
    function handleDragEnd(event: DragEndEvent ) {
        const {over} = event;
      
        setParent(over ? over.id : null);
      }
      
    const {setNodeRef,isOver} = useDroppable({
        id: generateId(),
        data: {
            type: props.type,
            duration: props.duration,
    }
    })

}
export default useDrop