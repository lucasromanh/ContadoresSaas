import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/useUserStore'

export const LoginPage: React.FC = () => {
  const [name, setName] = useState('')
  const [role, setRole] = useState<'admin' | 'contador' | 'cliente'>('contador')
  const login = useUserStore((s) => s.login)
  const navigate = useNavigate()

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    login({ id: '1', name: name || 'Demo', role })
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md p-6 bg-white border rounded space-y-4">
        <h2 className="text-xl font-semibold">Login - ContadorPro (placeholder)</h2>
        <input className="w-full p-2 border rounded" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="w-full p-2 border rounded" value={role} onChange={(e) => setRole(e.target.value as any)}>
          <option value="admin">Admin</option>
          <option value="contador">Contador</option>
          <option value="cliente">Cliente</option>
        </select>
        <button className="w-full bg-primary text-white p-2 rounded">Entrar</button>
      </form>
    </div>
  )
}
