import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUserStore } from '../store/useUserStore'

export const ProtectedRoute: React.FC<{ children: JSX.Element; roles?: string[] }> = ({ children, roles }) => {
  const user = useUserStore((s) => s.user)
  // If not authenticated, send users to the public home page where they can login or try demo
  if (!user) return <Navigate to="/home" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default ProtectedRoute
