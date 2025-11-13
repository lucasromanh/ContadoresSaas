import { create } from 'zustand'

type User = {
  id: string
  name: string
  role: 'admin' | 'contador' | 'cliente'
}

type State = {
  user: User | null
  login: (u: User) => void
  logout: () => void
}

export const useUserStore = create<State>((set) => ({
  user: null,
  login: (u: User) => set({ user: u }),
  logout: () => set({ user: null })
}))
