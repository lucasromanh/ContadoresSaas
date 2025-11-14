import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from './Card'

type Props = {
  title?: string
  children?: React.ReactNode
  to?: string
  onClick?: () => void
  className?: string
}

export const ClickableCard: React.FC<Props> = ({ title, children, to, onClick, className = '' }) => {
  const navigate = useNavigate()

  const handle = (e: React.MouseEvent) => {
    if (onClick) onClick()
    if (to) navigate(to)
  }

  return (
    <div onClick={handle} role={to ? 'link' : 'button'} className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}>
      <Card title={title}>{children}</Card>
    </div>
  )
}

export default ClickableCard
