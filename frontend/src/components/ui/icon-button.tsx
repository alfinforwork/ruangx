import { cn } from '@/libs/utils/cn'
import { Slot } from '@radix-ui/react-slot'
import { forwardRef } from 'react'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'ghost' | 'primary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles = {
  ghost: 'text-gray-400 hover:text-white hover:bg-surface-800',
  primary: 'text-brand-400 hover:text-brand-300 hover:bg-brand-600/20',
  outline: 'text-gray-300 border border-surface-700 hover:bg-surface-800',
}

const sizeStyles = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', asChild, className, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    )
  },
)
IconButton.displayName = 'IconButton'