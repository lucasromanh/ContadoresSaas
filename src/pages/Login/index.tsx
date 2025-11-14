import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/useUserStore'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Card className="w-full max-w-md p-6 mx-4" title="Login - ContadorPro (placeholder)">
        <form onSubmit={submit} className="space-y-4">
          <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />

          <div>
            <label className="sr-only">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full rounded-md border px-3 py-2 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="admin">Admin</option>
              <option value="contador">Contador</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>

          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </Card>
    </div>
  )
}
