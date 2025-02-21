
import React from 'react'

import {
  DndContext,
  useDraggable,
  useDroppable,
  UniqueIdentifier,
  DragEndEvent
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import usePlayerStore from '../../store/timelineStore'
import { useState } from 'react'

const Playground = () => {
  const rows = ['A', 'B', 'C']
  const [parent, setParent] = useState<UniqueIdentifier | null>(null)

  const item = <Draggable />
  const offsetX = usePlayerStore(state => state.offset)

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {parent === null ? item : null}

      <ul className='flex flex-col'>
        {rows.map(id => (
          <div className='border border-cyan-800 m-10'>
            {' '}
            <Droppable key={id} id={id} offset={offsetX}>
              {parent === id ? item : 'Drop here'}
            </Droppable>
          </div>
        ))}
      </ul>
    </DndContext>
  )

  function handleDragEnd (event: DragEndEvent) {
    const { over } = event

    setParent(over ? over.id : null)
  }
}

function Draggable () {
  const { attributes, isDragging, transform, setNodeRef, listeners } =
    useDraggable({
      id: 'draggable-item'
    })
  const offsetX = usePlayerStore(state => state.offset)
  const setOffsetX = usePlayerStore(state => state.setOffsetX)
    const getElementX= (element: HTMLElement) =>{
  const rect = element.getBoundingClientRect();
  const x = rect.left + window.scrollX;
  const y = rect.top + window.screenY;
    }
  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      event.preventDefault()
    event.stopPropagation()
      setOffsetX(event.pageX)
    }
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setOffsetX(event.pageX)
  }

  return (
    <div
      ref={setNodeRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      style={{
        color: 'red',
        backgroundColor: 'black',
        width: '400px',
        transform: CSS.Translate.toString(transform),
        boxShadow: isDragging
          ? '-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
          : undefined
      }}
      {...attributes}
      {...listeners}
    >
      Drag me
      <p>coord: {offsetX}</p>
    </div>
  )
}

interface DroppableProps {
  children: React.ReactNode
  id: string
  offset: number
}

function Droppable ({ id, children, offset }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      style={{
        marginLeft: offset,

        width: Infinity,
        height: 150,
        border: '1px solid',

        borderColor: isOver ? '#4c9ffe' : '#EEE'
      }}
      ref={setNodeRef}
    >
      {children}
    </div>
  )
}

export default Playground
