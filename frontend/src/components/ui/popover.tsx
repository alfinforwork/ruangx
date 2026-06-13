import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/libs/utils/cn'

export function Popover({ children, ...props }: PopoverPrimitive.PopoverProps) {
  return <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>
}

export function PopoverTrigger({ children, ...props }: PopoverPrimitive.PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger {...props}>{children}</PopoverPrimitive.Trigger>
}

export function PopoverContent({
  className,
  sideOffset = 4,
  ...props
}: PopoverPrimitive.PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 rounded-xl border border-surface-800 bg-surface-900 p-4 shadow-md animate-in fade-in-0 zoom-in-95',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}