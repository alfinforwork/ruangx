import * as ToastPrimitive from '@radix-ui/react-toast'
import { cn } from '@/libs/utils/cn'
import { X } from 'lucide-react'

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastViewport />
    </ToastPrimitive.Provider>
  )
}

function ToastViewport({ className }: { className?: string }) {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        'fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2',
        className,
      )}
    />
  )
}

interface ToastProps extends ToastPrimitive.ToastProps {
  title?: string
  description?: string
  action?: React.ReactNode
  onClose?: () => void
}

export function Toast({ title, description, action, onClose, className, ...props }: ToastProps) {
  return (
    <ToastPrimitive.Root
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-xl border border-surface-800 bg-surface-900 p-4 shadow-lg',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-right-full',
        'data-[state=open]:sm:slide-in-from-bottom-full',
        className,
      )}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <ToastPrimitive.Title className="text-sm font-medium text-white">
            {title}
          </ToastPrimitive.Title>
        )}
        {description && (
          <ToastPrimitive.Description className="text-xs text-gray-400">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      {action}
      <ToastPrimitive.Close
        onClick={onClose}
        className="shrink-0 rounded-full p-1 text-gray-400 hover:text-white hover:bg-surface-800 transition-colors"
      >
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}

export const ToastAction = ToastPrimitive.Action
export const ToastClose = ToastPrimitive.Close
export const ToastTitle = ToastPrimitive.Title
export const ToastDescription = ToastPrimitive.Description