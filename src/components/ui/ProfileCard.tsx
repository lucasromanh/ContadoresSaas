import React from 'react'
import { Button } from './Button'
import { useNavigate } from 'react-router-dom'

type User = {
  id: string
  name: string
  role: 'admin' | 'contador' | 'cliente'
} | null

const Avatar: React.FC<{ name?: string }> = ({ name }) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
    : 'U'

  return (
    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-800 dark:text-slate-100">
      {initials}
    </div>
  )
}

const ProfileCard: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate()
  if (!user)
    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">Invitado</div>
        <Button variant="ghost" size="sm">Entrar</Button>
      </div>
    )

  const goProfile = () => navigate('/profile')

  return (
    <div className="flex items-center justify-between space-x-3">
      <div className="flex items-center space-x-3">
        <Avatar name={user.name} />
        <div>
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</div>
          <div className="text-xs text-slate-600 dark:text-slate-300">{user.role}</div>
        </div>
      </div>
      <div>
        <Button variant="ghost" size="sm" onClick={goProfile}>Perfil</Button>
      </div>
    </div>
  )
}

export { ProfileCard }

export default ProfileCard
