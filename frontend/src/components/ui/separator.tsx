import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cn } from '@/libs/utils/cn'

export function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorPrimitive.SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        'shrink-0 bg-surface-800',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  )
}