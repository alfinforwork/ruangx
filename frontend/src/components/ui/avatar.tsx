import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/libs/utils/cn'
import { gradientFor, initialsFor } from '@/libs/utils/gradient'
import type { ComponentProps } from 'react'

interface AvatarProps extends ComponentProps<typeof AvatarPrimitive.Root> {
  src?: string | null
  alt?: string
  /** Stable seed for the gradient fallback (defaults to alt). */
  seed?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const sizeMap = {
  xs: 'h-8 w-8 text-[11px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-[42px] w-[42px] text-sm',
  lg: 'h-[46px] w-[46px] text-[15px]',
  xl: 'h-[72px] w-[72px] text-2xl',
  '2xl': 'h-[92px] w-[92px] text-3xl',
}

export function Avatar({
  src,
  alt = '',
  seed,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const gradient = gradientFor(seed ?? alt)
  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative inline-flex shrink-0 select-none overflow-hidden rounded-full',
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
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center font-bold tracking-wide text-white"
        style={{ backgroundImage: gradient }}
      >
        {initialsFor(alt)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
