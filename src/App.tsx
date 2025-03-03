import './App.css'
import React from 'react'
import TrackList from './components/tracks/trackList'

export default function App () {
  return <ButtonTest />
}

interface buttonProps {
  className?: string
  children?: React.ReactNode
  variant?: string
  size?: string
  disabled?: boolean
  fullWidth?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  onClick?: () => void
  label: string
  loading?: false
  loadingText?: null
  link?: null
}

const buttonVariants = {
  solid: 'text-white bg-[#232323] hover:bg-[#383838] active:bg-[#999999]',

  subtle: 'text-[#383838] bg-[#f3f3f3] hover:bg-[#ededed] active:bg-[#e2e2e2]',

  outline:
    'text-[#383838] bg-white border border-[#e2e2e2] hover:border-[#c7c7c7] active:border-[#c7c7c7] active:bg-[#e2e2e2]',

  ghost: 'text-[#383838]bg-transparent hover:bg-[#ededed] active:bg-[#e2e2e2]'
}

const buttonSizes = {
  xs: 'text-xs px-2 py-1 rounded-[4px]',
  sm: 'text-sm px-3 py-1.5 rounded-[6px]',
  md: 'text-sm px-[8px] py-[6px] rounded-[8px] font-normal',
  lg: 'text-lg px-5 py-2.5 rounded-[9px]',
  xl: 'text-xl px-6 py-3 rounded-[10px]'
}

const buttonDisabled = 'opacity-50 cursor-not-allowed pointer-events-none'

const Button: React.FC<buttonProps> = ({
  children,
  variant = '',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  prefix,
  suffix,
  onClick,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium  focus:outline-none '
  const variantClasses = buttonVariants[variant] || buttonVariants.solid
  const sizeClasses = buttonSizes[size] || buttonSizes.md
  const widthClass = fullWidth ? 'w-xl' : ''
  const disabledClass = disabled ? buttonDisabled : ''

  const buttonClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${disabledClass} ${className}`

  let paddingX = ''
  if (prefix || suffix) {
    if (size === 'xs') paddingX = prefix && suffix ? 'px-2' : 'pl-2 pr-3'
    else if (size === 'sm') paddingX = prefix && suffix ? 'px-3' : 'pl-2 pr-3'
    else if (size === 'md') paddingX = prefix && suffix ? 'px-3' : 'pl-3 pr-4'
    else if (size === 'lg') paddingX = prefix && suffix ? 'px-4' : 'pl-3 pr-5'
    else if (size === 'xl') paddingX = prefix && suffix ? 'px-5' : 'pl-4 pr-6'
  }

  const isIconOnly = variant === 'icon' || (!children && (prefix || suffix))
  const iconOnlyClass = isIconOnly ? 'aspect-square' : ''

  return (
    <button
      disabled={disabled}
      className={`${buttonClasses} ${paddingX} ${iconOnlyClass}`}
      onClick={onClick}
      {...props}
    >
      {prefix && <span className={`${children ? 'mr-2' : ''}`}>{prefix}</span>}
      {children}
      {suffix && <span className={`${children ? 'ml-2' : ''}`}>{suffix}</span>}
    </button>
  )
}

export const SolidButton = (props: buttonProps) => (
  <Button variant='solid' className='solid' {...props} />
)
export const OutlineButton = (props: buttonProps) => (
  <Button variant='primaryOutline' {...props} />
)
export const GhostButton = (props: buttonProps) => (
  <Button variant='ghost' {...props} />
)
export const SubtleButton = (props: buttonProps) => (
  <Button variant='subtle' {...props} />
)

const ButtonTest = () => {
  return (
    <div className='space-y-8 p-6 bg-[#ffffff] rounded '>
      <div className='space-y-2'>
        <h2 className='text-lg font-semibold'>Button Variants</h2>
        <div className='flex flex-wrap gap-2'>
          <Button label='button' variant='solid'>
            solid
          </Button>
          <Button label='button' variant='ghost'>
            ghost
          </Button>
          <Button label='button' variant='outline'>
            outline
          </Button>
          <Button label='button' variant='subtle'>
            subtle
          </Button>
        </div>
      </div>
    </div>
  )
}
