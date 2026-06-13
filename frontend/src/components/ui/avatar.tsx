import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/libs/utils/cn'
import type { ComponentProps } from 'react'

interface AvatarProps extends ComponentProps<typeof AvatarPrimitive.Root> {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

export function Avatar({ src, alt = '', size = 'md', className, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full',
        sizeMap[size],
        className,
      )}
      {...props}
    >
      <AvatarPrimitive.Image
        src={src ?? undefined}
        alt={alt}
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center bg-brand-700 text-white font-medium">
        {alt?.[0]?.toUpperCase() ?? '?'}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}