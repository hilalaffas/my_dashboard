'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cellKey } from '@/lib/pivot'
import { isApiEnabled } from '@/services/apiClient'
import { costColumnsApi } from '@/services/costColumnsService'

const withKey = (map, key, value) => {
  const next = { ...map }
  if (value === undefined) delete next[key]
  else next[key] = value
  return next
}

const messageOf = (e, fallback) => (e instanceof Error ? e.message : fallback)

/**
 * Kolom kustom tabel Cost milik pengguna. Hanya tersedia dengan backend (supported = false pada mode lokal).
 * Nilai sel diubah secara optimistis: tampil seketika, dikembalikan bila server menolak.
 */
export function useCostColumns(onError) {
  const [columns, setColumns] = useState([])
  const [values, setValues] = useState({})
  const [ready, setReady] = useState(!isApiEnabled)
  const valuesRef = useRef(values)

  useEffect(() => {
    valuesRef.current = values
  }, [values])

  const load = useCallback(async () => {
    try {
      const meta = await costColumnsApi.fetchMeta()
      const map = {}
      meta.values.forEach((v) => {
        map[cellKey(v.columnId, v.rowType, v.rowId)] = v.value
      })
      setColumns(meta.columns)
      setValues(map)
    } catch (e) {
      onError?.(messageOf(e, 'Gagal memuat kolom.'))
    } finally {
      setReady(true)
    }
  }, [onError])

  useEffect(() => {
    if (isApiEnabled) void load()
  }, [load])

  const valueOf = useCallback((columnId, rowType, rowId) => values[cellKey(columnId, rowType, rowId)], [values])

  async function addColumn(body) {
    try {
      const column = await costColumnsApi.create(body)
      setColumns((prev) => [...prev, column])
      return true
    } catch (e) {
      onError?.(messageOf(e, 'Gagal membuat kolom.'))
      return false
    }
  }

  async function updateColumn(id, body) {
    try {
      const column = await costColumnsApi.update(id, body)
      setColumns((prev) => prev.map((c) => (c.id === id ? column : c)))
      return true
    } catch (e) {
      onError?.(messageOf(e, 'Gagal menyimpan kolom.'))
      return false
    }
  }

  async function removeColumn(id) {
    try {
      await costColumnsApi.remove(id)
      setColumns((prev) => prev.filter((c) => c.id !== id))
      setValues((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(`${id}|`))))
      return true
    } catch (e) {
      onError?.(messageOf(e, 'Gagal menghapus kolom.'))
      return false
    }
  }

  /** direction: -1 = ke kiri, 1 = ke kanan. Urutan berubah seketika; bila gagal, dimuat ulang dari server. */
  async function moveColumn(id, direction) {
    const index = columns.findIndex((c) => c.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= columns.length) return
    const next = [...columns]
    ;[next[index], next[target]] = [next[target], next[index]]
    setColumns(next)
    try {
      await costColumnsApi.reorder(next.map((c) => c.id))
    } catch (e) {
      onError?.(messageOf(e, 'Gagal mengubah urutan kolom.'))
      await load()
    }
  }

  /** value: string, boolean, atau null untuk mengosongkan sel. */
  async function setCell(columnId, rowType, rowId, value) {
    const key = cellKey(columnId, rowType, rowId)
    const previous = valuesRef.current[key]
    const optimistic = value === null || value === '' || value === false ? undefined : String(value)
    setValues((prev) => withKey(prev, key, optimistic))
    try {
      const saved = await costColumnsApi.setCell(columnId, { rowType, rowId, value })
      setValues((prev) => withKey(prev, key, saved?.value ?? undefined))
    } catch (e) {
      setValues((prev) => withKey(prev, key, previous))
      onError?.(messageOf(e, 'Gagal menyimpan nilai.'))
    }
  }

  return {
    supported: isApiEnabled,
    ready,
    columns,
    valueOf,
    actions: { addColumn, updateColumn, removeColumn, moveColumn, setCell },
  }
}
