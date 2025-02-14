import React, { useCallback, useEffect, useState } from 'react'
import { DragData, TrackItem, TrackRow } from '../../types/types'
import { nanoid } from 'nanoid'

const TrackList: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false)
  //move to store later
  const [dragData, setDragData] = useState<DragData | null>({
    dataInfo: '',
    dragPoint: { x: 0, y: 0 }
  })
  const [trackList, setTrackList] = useState<TrackItem[]>([])
  const [currentRow, setCurrentRow] = useState<TrackRow | null>(null)
  const [Row, setRow] = useState<TrackRow[]>([])
  const [dragElement, setDragElement] = useState<HTMLElement | null>(null)

  function handleMouseDown (event: React.MouseEvent) {
    const target = (event.target as HTMLElement).closest(
      '.trackItem'
    ) as HTMLElement

    if (!target) {
      return
    }
    setDragElement(target)
    event.stopPropagation()
    event.preventDefault()
    setIsDragging(true)
    setDragData({
      dataInfo: target.id,
      dragType: target.dataset.type as TrackItem | undefined,
      dragPoint: {
        x: event.pageX,
        y: event.pageY
      }
    })
    target.dataset.startX = (event.pageX - target.offsetLeft).toString()
    target.dataset.startY = (event.pageY - target.offsetTop).toString()
  }
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (isDragging && dragElement) {
        setDragData(currentDragData => ({
          ...currentDragData,
          dragPoint: {
            x: event.pageX,
            y: event.pageY
          }
        }))
      }
    },
    [isDragging, dragElement]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragElement(null)
  }, [])

  //make row active
  function selectRow (row: TrackRow, event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (currentRow && row.rowId === row.rowId) {
      setCurrentRow(null)
    } else {
      setCurrentRow(row)
    }
  }

  //add a new row to the row list
  function addRow (row: TrackRow) {
    const id = nanoid(5)
    const newRow = { ...row, rowId: id }
    setRow(prevRows => [...prevRows, newRow])
    setRow([...Row, newRow])
    return newRow
  }

  //insert item in a row and create a new row if there is no row
  function insertItemInRow (item: TrackItem, dragData: DragData) {
    if (isDragging) {
      let targetRow: Element | null = null
      let targetRowIndex = -1

      for (let i = 0; i < Row.length; i++) {
        const row = Row[i]
        const rowElement = document.querySelector(`[row-id="${row.rowId}"]`)
        if (rowElement) {
          const rect = rowElement.getBoundingClientRect()
          if (
            dragData.dragPoint.y >= rect.top &&
            dragData.dragPoint.y <= rect.bottom
          ) {
            targetRow = rowElement
            targetRowIndex = i
            break
          }
        }
      }

      if (!targetRow) {
        const newRow: TrackRow = {
          rowId: nanoid(5),
          type: item,
          list: [item]
        }
        const addedRow = addRow(newRow)

        const updatedAddedRow = {
          ...addedRow,
          list: [item]
        }

        setRow(prevRows => {
          const newRowList = [...prevRows]
          const newRowIndex = newRowList.findIndex(
            r => r.rowId === addedRow.rowId
          )
          newRowList[newRowIndex] = updatedAddedRow

          return newRowList
        })
      } else {
        const rect = targetRow.getBoundingClientRect()
        const insertionX = dragData.dragPoint.x - rect.left
        const numItemsInRow = Row[targetRowIndex].list.length

        let insertIndex = 0
        if (numItemsInRow > 0) {
          const rowWidth = rect.width
          const itemWidth = rowWidth / (numItemsInRow + 1)
          insertIndex = Math.round(insertionX / itemWidth)
          insertIndex = Math.max(0, Math.min(insertIndex, numItemsInRow))
        }

        const updatedRow = {
          ...Row[targetRowIndex],
          list: [
            ...Row[targetRowIndex].list.slice(0, insertIndex),
            item,
            ...Row[targetRowIndex].list.slice(insertIndex)
          ]
        }

        const newRowList = [...Row]
        newRowList[targetRowIndex] = updatedRow
        setRow(newRowList)
      }
    }
  }

  return <></>
}
export default TrackList
