'use client'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)
export function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const timer = useRef(undefined)
  const notify = useCallback((text) => {
    setMessage(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(''), 2800)
  }, [])
  return (
    <ToastContext.Provider value={notify}>
      {children}
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  )
}
