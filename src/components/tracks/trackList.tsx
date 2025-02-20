import { useDraggable } from "@dnd-kit/core"
import { generateId } from "../../utils/helpers"

const TrackList = (props: ) =>{
    const {setNodeRef,attributes,transform,isDragging,over} = useDraggable({
        id: generateId(),
        data:{
            type: props.type,

        }
        
    })
}