'use client'
import { MoreHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/** Judul kolom kustom beserta menu: ubah, geser kiri/kanan, hapus. */
export function ColumnHeader({ column, canMoveLeft, canMoveRight, onEdit, onMove, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function choose(action) {
    setOpen(false)
    action()
  }

  return (
    <th className="pv-custom-head" scope="col">
      <div className="pv-head" ref={ref}>
        <span className="pv-head-name" title={column.name}>
          {column.name}
        </span>
        <button
          type="button"
          className="icon-action pv-head-menu"
          aria-label={`Menu kolom ${column.name}`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <MoreHorizontal size={15} />
        </button>
        {open && (
          <div className="popover pv-menu" role="menu">
            <button type="button" role="menuitem" className="popover-item" onClick={() => choose(() => onEdit(column))}>
              Ubah kolom
            </button>
            <button
              type="button"
              role="menuitem"
              className="popover-item"
              disabled={!canMoveLeft}
              onClick={() => choose(() => onMove(column, -1))}
            >
              Geser ke kiri
            </button>
            <button
              type="button"
              role="menuitem"
              className="popover-item"
              disabled={!canMoveRight}
              onClick={() => choose(() => onMove(column, 1))}
            >
              Geser ke kanan
            </button>
            <button type="button" role="menuitem" className="popover-item pv-danger" onClick={() => choose(() => onDelete(column))}>
              Hapus kolom
            </button>
          </div>
        )}
      </div>
    </th>
  )
}
