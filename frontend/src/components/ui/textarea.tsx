import { forwardRef, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/libs/utils/cn'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  autoResize?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, autoResize = true, ...props }, forwardedRef) => {
    const internalRef = useRef<HTMLTextAreaElement>(null)
    const ref = (forwardedRef ?? internalRef) as React.RefObject<HTMLTextAreaElement>

    const resize = useCallback(() => {
      const el = ref.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [ref])

    useEffect(() => {
      if (autoResize) resize()
    }, [autoResize, resize])

    return (
      <div className="space-y-1.5">
        <textarea
          ref={ref}
          onInput={autoResize ? resize : undefined}
          className={cn(
            'flex w-full rounded-xl border bg-surface-850 px-3 py-2 text-sm text-white placeholder:text-gray-500 transition-colors resize-none min-h-[60px]',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
            error ? 'border-red-500 focus:ring-red-500/50' : 'border-surface-700',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'