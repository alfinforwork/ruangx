import * as SheetPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/libs/utils/cn'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'

export function Sheet({ children, ...props }: SheetPrimitive.DialogProps) {
  return <SheetPrimitive.Root {...props}>{children}</SheetPrimitive.Root>
}

export function SheetTrigger({ children, ...props }: SheetPrimitive.DialogTriggerProps) {
  return <SheetPrimitive.Trigger {...props}>{children}</SheetPrimitive.Trigger>
}

export function SheetClose({ children, ...props }: SheetPrimitive.DialogCloseProps) {
  return <SheetPrimitive.Close {...props}>{children}</SheetPrimitive.Close>
}

interface SheetContentProps extends SheetPrimitive.DialogContentProps {
  side?: 'left' | 'right'
}

export function SheetContent({
  className,
  children,
  side = 'left',
  ...props
}: SheetContentProps) {
  const sideStyles = {
    left: 'inset-y-0 left-0 h-full w-72 border-r data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
    right: 'inset-y-0 right-0 h-full w-72 border-l data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  }

  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <SheetPrimitive.Content
        className={cn(
          'fixed z-50 gap-4 bg-surface-900 p-6 shadow-lg transition ease-in-out duration-200',
          sideStyles[side],
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:text-white hover:bg-surface-800 transition-colors">
          <X className="h-4 w-4" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

export function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mb-6', className)} {...props} />
}

export function SheetTitle({ className, ...props }: SheetPrimitive.DialogTitleProps) {
  return (
    <SheetPrimitive.Title
      className={cn('text-lg font-semibold text-white', className)}
      {...props}
    />
  )
}