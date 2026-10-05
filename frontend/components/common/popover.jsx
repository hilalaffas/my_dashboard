'use client'
import { useEffect, useRef, useState } from 'react'
export function Popover({ trigger, triggerClassName, label, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  return (
    <div className="popover-wrap" ref={ref}>
      <button
        className={triggerClassName}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </button>
      {open && <div className="popover">{children(() => setOpen(false))}</div>}
    </div>
  )
}
