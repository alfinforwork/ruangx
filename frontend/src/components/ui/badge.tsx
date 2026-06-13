import { cn } from '@/libs/utils/cn'
import type { ComponentProps } from 'react'

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'danger'

interface BadgeProps extends ComponentProps<'span'> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-800 text-gray-300',
  brand: 'bg-brand-600/20 text-brand-300 border border-brand-500/30',
  success: 'bg-green-600/20 text-green-300 border border-green-500/30',
  warning: 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30',
  danger: 'bg-red-600/20 text-red-300 border border-red-500/30',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}