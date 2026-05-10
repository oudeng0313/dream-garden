import type { DreamRecord } from './types'

const KEY = 'dream-garden-records'

export function saveDream(record: DreamRecord): void {
  const all = loadAllDreams()
  all.unshift(record)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function loadAllDreams(): DreamRecord[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function deleteDream(id: string): void {
  const all = loadAllDreams().filter((d) => d.id !== id)
  localStorage.setItem(KEY, JSON.stringify(all))
}