import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:brightness-95',
        success: 'bg-emerald-600 text-white hover:brightness-95',
        info: 'bg-sky-500 text-white hover:brightness-95',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
        outline: 'border border-slate-200 dark:border-slate-700'
      },
      size: {
        sm: 'px-2 py-1 text-sm',
        md: 'px-3 py-1.5',
        lg: 'px-4 py-2'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button: React.FC<ButtonProps> = ({ className, variant, size, children, ...props }) => {
  return (
    <button {...props} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </button>
  )
}

export default Button
