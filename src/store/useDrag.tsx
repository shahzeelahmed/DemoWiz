import { useDraggable } from "@dnd-kit/core";
import { nanoid } from "nanoid";
import React from "react";
import { generateId } from "../utils/helpers";
 const useDrag = () => {
    const {attributes, listeners, setNodeRef, transform,isDragging} = useDraggable({
        id: generateId(),

    })
    


 }