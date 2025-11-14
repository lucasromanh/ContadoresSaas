import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const inputVariants = cva('flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary', {
  variants: {
    variant: {
    default: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
      ghost: 'bg-transparent'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, variant, ...props }, ref) => {
  return <input ref={ref} {...props} className={cn(inputVariants({ variant }), className)} />
})

Input.displayName = 'Input'

export default Input
