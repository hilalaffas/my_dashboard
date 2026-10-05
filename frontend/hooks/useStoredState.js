'use client'
import { useEffect, useState } from 'react'
export function useStoredState(key, initial) {
  const [value, setValue] = useState(initial)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) setValue(JSON.parse(raw))
    } catch {}
    setReady(true)
  }, [key])
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value, ready])
  return [value, setValue, ready]
}
