export type Role = 'admin' | 'contador' | 'cliente'

export type User = {
  id: string
  name: string
  role: Role
}
