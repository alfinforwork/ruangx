import { cn } from '@/libs/utils/cn'
import type { ComponentProps } from 'react'

interface CardProps extends ComponentProps<'div'> {
  hover?: boolean
}

export function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-surface-800 bg-surface-900 p-4',
        hover && 'transition-colors hover:bg-surface-850',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('mb-3 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}