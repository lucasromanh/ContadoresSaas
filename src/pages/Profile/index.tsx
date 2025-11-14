import React from 'react'
import { Card } from '../../components/ui/Card'
import { useUserStore } from '../../store/useUserStore'

export const ProfilePage: React.FC = () => {
  const user = useUserStore((s) => s.user)

  if (!user) return <div className="p-6">No hay usuario logueado</div>

  return (
    <div className="p-6">
      <Card title="Perfil">
        <div className="space-y-2">
          <div className="text-sm">Nombre: <span className="font-medium">{user.name}</span></div>
          <div className="text-sm">Rol: <span className="font-medium">{user.role}</span></div>
          <div className="pt-3">
            <button className="px-3 py-1 rounded bg-primary text-white">Editar</button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProfilePage
