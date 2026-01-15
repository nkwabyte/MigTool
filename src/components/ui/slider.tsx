import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={`relative flex w-full touch-none select-none items-center ${className || ''}`}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[#3E3E42]">
      <SliderPrimitive.Range className="absolute h-full bg-[#00A9E0]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-[#00A9E0] bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00A9E0] disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
