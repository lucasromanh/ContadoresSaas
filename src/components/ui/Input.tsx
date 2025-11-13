import React from 'react'

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return <input {...props} className={`w-full p-2 border rounded ${className}`} />
}
