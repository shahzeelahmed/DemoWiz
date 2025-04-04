'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from './lib/utils'
import { Paintbrush } from 'lucide-react'
import React from 'react'
import { useMemo, useState } from 'react'

export function ColorPicker ({ onChange }: { onChange?: (bg: string) => void }) {
  const [background, setBackground] = useState('#FFFFFF')
  const handleBackgroundChange = (bg: string) => {
    setBackground(bg)
    onChange?.(bg)
  }

  return (
    <GradientPicker
    className='mt-2'
      background={background}
      setBackground={handleBackgroundChange}
    />
  )
}

export function GradientPicker ({
  background,
  setBackground,
  className
}: {
  background: string
  setBackground: (background: string) => void
  className?: string
}) {
  const solids = [
    '#E2E2E2',
    '#ff75c3',
    '#ffa647',
    '#ffe83f',
    '#9fff5b',
    '#70e2ff',
    '#cd93ff',
    '#09203f',
    '#FFF0A0',
    '#FFAB40',
    '#FF6B00',
    '#C65A00',
    '#984209',
    '#FFF89D',
    '#FFE07A',
    '#FFC02E',
    '#DAAE15',
    '#BC9C12',
    '#99F2EB',
    '#6EE7D8',
    '#35D0AC',
    '#19B3B8',
    '#109789',
    '#B0ACF7',
    '#C4AFEE',
    '#9B58EF',
    '#703EEA',
    '#502EB8',
    '#A0D0FA',
    '#A0C6F7',
    '#6893F3',
    '#3C88DC',
    '#2880AB',
    '#FFBCE5',
    '#FF99AD',
    '#FF7788',
    '#FF5577',
    '#FF3366',
    '#E6B8FF',
    '#D9A0FF',
    '#CC83FF',
    '#BF66FF',
    '#B14BFF'
  ]

  const defaultTab = useMemo(() => {
    return 'solid'
  }, [background])

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant={'ghost'}
          className={cn(
            'w-[220px] justify-start text-left font-normal bg-white',
            !background && 'text-muted-foreground bg-amber-200',
            className
          )}
        >
          <div className='w-full flex items-center gap-2 '>
            {background ? (
              <div
                className='h-4 w-4 rounded  transition-all border-1 border-black p-1'
                style={{ background }}
              ></div>
            ) : (
              <Paintbrush className='h-4 w-4' />
            )}
            <div className='truncate flex-1'>
              {background ? background : 'Pick a color'}
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-64'>
        <Tabs defaultValue={defaultTab} className='w-full'>
          <TabsList className='w-full mb-4'>
            <TabsTrigger className='flex-1' value='solid'>
              Solid
            </TabsTrigger>
          </TabsList>

          <TabsContent value='solid' className='flex flex-wrap gap-1 mt-0'>
            {solids.map(s => (
              <div
                key={s}
                style={{ background: s }}
                className='rounded h-6 w-6 cursor-pointer active:scale-105'
                onClick={() => setBackground(s)}
              />
            ))}
          </TabsContent>
        </Tabs>

        <Input
          id='custom'
          value={background}
          className='col-span-2 h-8 mt-4'
          onChange={e => setBackground(e.currentTarget.value)}
        />
      </PopoverContent>
    </Popover>
  )
}
