import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/components/ui/lib/utils';
import { Range, Root, Thumb, Track } from '@radix-ui/react-slider';
import Color from 'color';
import React, { memo } from 'react';
import { PipetteIcon } from 'lucide-react';
import {
  type ChangeEventHandler,
  type ComponentProps,
  type HTMLAttributes,
  useCallback,
  
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { createContext, useContext } from 'react';
import { HSVToHex, RGBToHex } from '@/utils/colorUtils';

interface ColorPickerContextValue {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  mode: string;
  val: number;
  setHue: (hue: number) => void;
  setValue: (value: number) => void;
  setSaturation: (saturation: number) => void;
  setLightness: (lightness: number) => void;
  setAlpha: (alpha: number) => void;
  setMode: (mode: string) => void;
  onChange?: (value: any) => void;
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(
  undefined
);

export const useColorPicker = () => {
  const context = useContext(ColorPickerContext);

  if (!context) {
    throw new Error('useColorPicker must be used within a ColorPickerProvider');
  }

  return context;
};

export type ColorPickerProps = HTMLAttributes<HTMLDivElement> & {
  value?: Parameters<typeof Color>[0];
  defaultValue?: Parameters<typeof Color>[0];
  onChange?: (value: Parameters<typeof Color.rgb>[0]) => void;
};

const ColorPickerComponent = ({
  value,
  defaultValue = '#000000',
  onChange,
  className,
  ...props
}: ColorPickerProps) => {
  const selectedColor = Color(value);
  const defaultColor = Color(defaultValue);

  const [hue, setHue] = useState(
    selectedColor.hue() || defaultColor.hue() || 0
  );
  const [saturation, setSaturation] = useState(
    selectedColor.saturationl() || defaultColor.saturationl() || 100
  );
  const [lightness, setLightness] = useState(
    selectedColor.lightness() || defaultColor.lightness() || 50
  );
  const [alpha, setAlpha] = useState(
    selectedColor.alpha() * 100 || defaultColor.alpha() * 100
  );
  const [mode, setMode] = useState('hex');
  const [val,setValue] = useState(selectedColor.value() || defaultColor.value() || 100)
  // Update color when controlled value changes
  useEffect(() => {
    if (value) {
      const color = Color.rgb(value).rgb().object();

      setHue(color.r);
      setSaturation(color.g);
      setLightness(color.b);
      setAlpha(color.a);
    }
  }, [value]);

  // Notify parent of changes
  // useEffect(() => {
  //   if (onChange) {
  //     const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100);
  //     const rgba = color.rgb().array();

  //     onChange([rgba[0], rgba[1], rgba[2], alpha / 100]);
  //   }
  // }, [hue, saturation, lightness, alpha, onChange]);
  return (

    <ColorPickerContext.Provider
      value={{
        val,
        hue,
        saturation,
        lightness,
        alpha,
        mode,
        setValue,
        setHue,
        setSaturation,
        setLightness,
        setAlpha,
        setMode,
        onChange, // Pass onChange from props to context
      }}
    >
      <div className={cn('grid w-full gap-4', className)} {...props} />
      
    </ColorPickerContext.Provider>
  
  );
};

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>;
const ColorPickerSelectionComponent = ({
  className,
  ...props
}: ColorPickerSelectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { hue, setSaturation, setLightness } = useColorPicker();

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!isDragging || !containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / rect.width)
      );
      const y = Math.max(
        0,
        Math.min(1, (event.clientY - rect.top) / rect.height)
      );

      setPosition({ x, y });
      
      setSaturation(x * 100);
      const topLightness = x < 0.01 ? 100 : 50 + (50 * (1 - x));
      const lightness = topLightness * (1 - y);
      setLightness(lightness);
    },
    [isDragging, setSaturation, setLightness]
  );

  useEffect(() => {
    const handlePointerUp = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-[4/3] w-full  rounded',
        className
      )}
      style={{
        background: `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
        linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
        hsl(${hue}, 100%, 50%)`
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        setIsDragging(true);
        handlePointerMove(e.nativeEvent);
      }}
      {...props}
    >
      <div
        className=" absolute h-4 w-4 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${position.x * 100}%`,
          top: `${position.y * 100}%`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  );
};

export type ColorPickerHueProps = HTMLAttributes<HTMLDivElement>;

const ColorPickerHueComponent = ({
  className,
  ...props
}: ColorPickerHueProps) => {
  const { hue, setHue } = useColorPicker();

  return (
    <Root
      value={[hue]}
      max={360}
      step={1}
      className={cn('relative flex h-4 w-full touch-none', className)}
      onValueChange={([hue]) => setHue(hue)}
      {...props}
    >
      <Track className="relative my-0.5 h-3 w-full grow rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
        <Range className="absolute h-full" />
      </Track>
      <Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </Root>
  );
};

export type ColorPickerAlphaProps = HTMLAttributes<HTMLDivElement>;
const ColorPickerAlphaComponent = ({
  className,
  ...props
}: ColorPickerAlphaProps) => {
  const { alpha, setAlpha } = useColorPicker();

  return (
    <Root
      value={[alpha]}
      max={100}
      step={1}
      className={cn('relative flex h-4 w-full touch-none', className)}
      onValueChange={([alpha]) => setAlpha(alpha)}
      {...props}
    >
      <Track
        className="relative my-0.5 h-3 w-full grow rounded-full"
        style={{
          background:
            'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==") left center',
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-primary/50" />
        <Range className="absolute h-full rounded-full bg-transparent" />
      </Track>
      <Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </Root>
  );
};

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>;

const ColorPickerEyeDropperComponent = ({
  className,
  ...props
}: ColorPickerEyeDropperProps) => {
  const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker();

  const handleEyeDropper = async () => {
    try {
      // @ts-ignore - EyeDropper API is experimental
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      const color = Color(result.sRGBHex);
      const [h, s, l] = color.hsl().array();

      setHue(h);
      setSaturation(s);
      setLightness(l);
      setAlpha(100);
    } catch (error) {
      console.error('EyeDropper failed:', error);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleEyeDropper}
      className={cn('shrink-0 text-muted-foreground', className)}
      {...props}
    >
      <PipetteIcon size={16} />
    </Button>
  );
};

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>;

const formats = ['hex', 'rgb', 'css', 'hsl'];

const ColorPickerOutputComponent = ({
  className,
  ...props
}: ColorPickerOutputProps) => {
  const { mode, setMode } = useColorPicker();

  return (
    <Select value={mode} onValueChange={setMode}>
      <SelectTrigger className="h-8 w-[4.5rem] shrink-0 text-xs" {...props}>
        <SelectValue placeholder="Mode" />
      </SelectTrigger>
      <SelectContent>
        {formats.map((format) => (
          <SelectItem key={format} value={format} className="text-xs">
            {format.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

type PercentageInputProps = ComponentProps<typeof Input>;

const PercentageInputComponent = ({ className, ...props }: PercentageInputProps) => {
  return (
    <div className="relative">
      <Input
        type="text"
        {...props}
        className={cn(
          'h-8 w-[3.25rem] rounded-l-none bg-secondary px-2 text-xs shadow-none',
          className
        )}
      />
      <span className="-translate-y-1/2 absolute top-1/2 right-2 text-muted-foreground text-xs">
        %
      </span>
    </div>
  );
};


export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>;
const ColorPickerFormatComponent = ({
  className,
  ...props
}: ColorPickerFormatProps) => {
  const {
    val,
    hue,
    saturation,
    lightness,
    alpha,
    mode,
    setValue,
    setHue,
    setSaturation,
    setLightness,
    setAlpha,
    onChange: contextOnChange,
  } = useColorPicker();
  const color = Color.hsl(hue, saturation, lightness, alpha / 100);
  
  if (mode === 'hex') {
    let hex = color.hex();

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      try {
        const newColor = Color(event.target.value);
        setValue(newColor.value());
        setHue(newColor.hue());
        setSaturation(newColor.saturationl());
        setLightness(newColor.lightness());
        setAlpha(newColor.alpha() * 100);
        if (contextOnChange) {
          contextOnChange(newColor.hex());
        }
      } catch (error) {
        console.error('Invalid hex color:', error);
      }
    };

    return (
      <div
        className={cn(
          '-space-x-px relative flex items-center shadow-sm',
          className
        )}
        {...props}
      >
    
        <input
          type="text"
          value={color.hex()}
          onChange={(e)=>{ console.log('hex',e.target.value);handleChange(e)}}
          className="h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none"
        />
        <PercentageInput value={alpha} />
      </div>
    );
  }

  if (mode === 'rgb') {
    const rgb = color
      .rgb()
      .array()
      .map((value) => Math.round(value));

    // Handler to update individual RGB values
    const handleRGBChange = (index: number, newValue: string) => {
      const numericValue = Math.max(0, Math.min(255, Number(newValue.replace(/[^\d]/g, ''))));
      let [r, g, b] = rgb;
      if (index === 0) r = numericValue;
      if (index === 1) g = numericValue;
      if (index === 2) b = numericValue;
      setHue(Color.rgb(r, g, b).hue());
      setSaturation(Color.rgb(r, g, b).saturationl());
      setLightness(Color.rgb(r, g, b).lightness());
      if (contextOnChange) {
        contextOnChange([r, g, b, alpha]);
      }
    };


    return (
      <div
        className={cn('-space-x-px flex items-center shadow-sm', className)}
        {...props}
      >
        {rgb.map((value, index) => (
          <Input
            key={index}
            type="number"
            min={0}
            max={255}
            value={value}
            onChange={(e) => handleRGBChange(index, e.target.value)}
            className={cn(
              'h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none',
              index && 'rounded-l-none',
              className
            )}
          />
        ))}
        <PercentageInput value={alpha} />
      </div>
    );
  }

  if (mode === 'css') {
    const rgb = color
      .rgb()
      .array()
      .map((value) => Math.round(value));

    return (
      <div className={cn('w-full shadow-sm', className)} {...props}>
        <Input
          type="text"
          className="h-8 w-full bg-secondary px-2 text-xs shadow-none"
          value={`rgba(${rgb.join(', ')}, ${alpha}%)`}
          readOnly
          {...props}
        />
      </div>
    );
  }

  if (mode === 'hsl') {
    const hsl = color
      .hsl()
      .array()
      .map((value) => Math.round(value));

    return (
      <div
        className={cn('-space-x-px flex items-center shadow-sm', className)}
        {...props}
      >
        {hsl.map((value, index) => (
          <Input
            key={index}
            type="text"
            value={value}
            readOnly
            className={cn(
              'h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none',
              index && 'rounded-l-none',
              className
            )}
          />
        ))}
        <PercentageInput value={alpha} />
      </div>
    );
  }

  return null;
};

export const ColorPicker = memo(ColorPickerComponent);
export const ColorPickerSelection = memo(ColorPickerSelectionComponent);
export const ColorPickerHue = memo(ColorPickerHueComponent);
export const ColorPickerAlpha = memo(ColorPickerAlphaComponent);
export const ColorPickerEyeDropper = memo(ColorPickerEyeDropperComponent);
export const ColorPickerOutput = memo(ColorPickerOutputComponent);
export const PercentageInput = memo(PercentageInputComponent);
export const ColorPickerFormat = memo(ColorPickerFormatComponent);
