import React from 'react'

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...props }) => {
  return (
    <button
      {...props}
      className={`inline-flex items-center px-3 py-1.5 rounded-md bg-primary text-white hover:brightness-95 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  )
}
