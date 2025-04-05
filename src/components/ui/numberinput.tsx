import * as React from 'react'
import { useState, useCallback } from 'react'
import { cn } from './lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface NumberInputWithUnitProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value' | 'type'
  > {
  unit: string
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number) => void
}

const NumberInputWithUnit = React.forwardRef<
  HTMLInputElement,
  NumberInputWithUnitProps
>(
  (
    {
      className,
      unit,
      value: controlledValue,
      defaultValue = 0,
      min = 0,
      max = Infinity,
      step = 1,
      onValueChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(
      controlledValue ?? defaultValue
    )

    React.useEffect(() => {
      if (controlledValue !== undefined) {
        setInternalValue(controlledValue)
      }
    }, [controlledValue])

    const updateValue = useCallback(
      (newValue: number) => {
        const clampedValue = Math.max(min, Math.min(newValue, max))
        if (controlledValue === undefined) {
          setInternalValue(clampedValue)
        }
        onValueChange?.(clampedValue)
      },
      [min, max, onValueChange, controlledValue]
    )

    const handleIncrement = () => {
      updateValue(internalValue + step)
    }

    const handleDecrement = () => {
      updateValue(internalValue - step)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const stringValue = e.target.value
      if (stringValue === '') {
        updateValue(min)
        return
      }
      const numericValue = parseInt(stringValue, 10)
      if (!isNaN(numericValue)) {
        if (controlledValue === undefined) {
          setInternalValue(numericValue)
        }
        updateValue(numericValue)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const currentDisplayedValue = e.target.value
      const numericValue = parseInt(currentDisplayedValue, 10)

      if (isNaN(numericValue) || currentDisplayedValue === '') {
        updateValue(min)
      } else {
        updateValue(numericValue)
      }

      props.onBlur?.(e)
    }

    return (
      <div
        className={cn(
          'inline-flex  h-10 items-center justify-center rounded-md  border-input bg-background  text-sm ring-offset-background',
          disabled ? 'cursor-not-allowed opacity-50' : '',
          className
        )}
      >
        <Input
          ref={ref}
          type='text'
          inputMode='numeric'
          pattern='[0-9]*'
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'w-8 border-0 bg-white p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex justify-center items-center content-center',
            'text-base font-semibold text-center mr-2 tabular-nums'
          )}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          {...props}
        />
        <span className='text-muted-foreground  select-none whitespace-nowrap '>
          {unit}
        </span>
        <div className='ml-2 flex flex-col items-center justify-between h-full '>
          <Button
            variant='ghost'
            size='icon'
            className='h-4 w-4 p-0'
            onClick={handleIncrement}
            disabled={disabled || internalValue >= max}
            aria-label='Increment value'
          >
            <ChevronUp />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-4 w-4 p-0'
            onClick={handleDecrement}
            disabled={disabled || internalValue <= min}
            aria-label='Decrement value'
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
    )
  }
)


export { NumberInputWithUnit }
