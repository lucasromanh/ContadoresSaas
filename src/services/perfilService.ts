import { PerfilContador } from '../types/perfil'
import perfilMock from '../pages/Perfil/mocks/perfilMock'

const STORAGE = 'perfil_store_v1'

let perfil: PerfilContador | null = null

function persist(){
  try{ if (perfil) localStorage.setItem(STORAGE, JSON.stringify(perfil)) }catch(e){}
}

const perfilService = {
  load: async (): Promise<PerfilContador> => {
    if (perfil) return perfil
    try{
      const raw = localStorage.getItem(STORAGE)
      if (raw){ perfil = JSON.parse(raw) as PerfilContador; return perfil }
    }catch(e){}
    perfil = perfilMock
    persist()
    return perfil
  },
  get: () => perfil,
  getFresh: async () => { return perfilService.load() },
  update: async (patch: Partial<PerfilContador>) => {
    if (!perfil) await perfilService.load()
    perfil = { ...(perfil as PerfilContador), ...(patch as any) }
    persist()
    return perfil
  },
  saveAvatar: async (dataUrl: string) => {
    if (!perfil) await perfilService.load()
    perfil = { ...(perfil as PerfilContador), avatarUrl: dataUrl }
    persist()
    return perfil
  },
  saveFirma: async (dataUrl: string) => {
    if (!perfil) await perfilService.load()
    perfil = { ...(perfil as PerfilContador), firmaDigitalUrl: dataUrl }
    persist()
    return perfil
  }
}

export default perfilService
