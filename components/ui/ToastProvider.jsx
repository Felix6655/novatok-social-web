'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, Sparkles } from 'lucide-react'

const ToastContext = createContext(null)

const TOAST_DURATION = 4000

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  unlock: Sparkles,
}

const toastStyles = {
  success: 'bg-green-900/90 border-green-500/50 text-green-100',
  error: 'bg-red-900/90 border-red-500/50 text-red-100',
  info: 'bg-blue-900/90 border-blue-500/50 text-blue-100',
  unlock: 'bg-gradient-to-r from-purple-900/90 to-pink-900/90 border-purple-500/50 text-purple-100',
}

const iconStyles = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  unlock: 'text-purple-400',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ type = 'info', message }) => {
    const id = Date.now() + Math.random()
    
    setToasts(prev => [...prev, { id, type, message }])
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, TOAST_DURATION)
    
    return id
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = toastIcons[t.type] || Info
          return (
            <div
              key={t.id}
              className={`
                pointer-events-auto
                flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm
                shadow-lg min-w-[280px] max-w-[90vw]
                animate-toast-in
                ${toastStyles[t.type] || toastStyles.info}
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${iconStyles[t.type] || iconStyles.info}`} />
              <span className="flex-1 text-sm font-medium">{t.message}</span>
              <button
                onClick={() => dismissToast(t.id)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 opacity-60" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
