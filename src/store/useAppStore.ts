import { create } from 'zustand'

type State = {
  backendOnline: boolean
  setBackendOnline: (v: boolean) => void
}

export const useAppStore = create<State>((set) => ({
  // Start as false so the UI uses mock data until we confirm the backend is reachable.
  backendOnline: false,
  setBackendOnline: (v: boolean) => set({ backendOnline: v })
}))

export default useAppStore
