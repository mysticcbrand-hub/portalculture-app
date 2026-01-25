'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'

// Types
interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

interface NotificationContextType {
  notify: (type: Notification['type'], message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

// Context
const NotificationContext = createContext<NotificationContextType | null>(null)

// Hook
export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

// Icons
const icons = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
}

// Colors
const colors = {
  success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
  error: 'bg-red-500/20 border-red-500/30 text-red-400',
  info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  warning: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
}

const iconColors = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
}

// Single notification component
function NotificationItem({ notification, onRemove }: { notification: Notification; onRemove: () => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Enter animation
    requestAnimationFrame(() => setIsVisible(true))

    // Auto dismiss
    const duration = notification.duration || 4000
    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(onRemove, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [notification.duration, onRemove])

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-2 opacity-0 scale-95'}
      `}
    >
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl border
        backdrop-blur-xl bg-black/60
        shadow-lg shadow-black/20
        ${colors[notification.type]}
      `}>
        {/* Icon */}
        <span className={iconColors[notification.type]}>
          {icons[notification.type]}
        </span>

        {/* Message */}
        <p className="text-white/90 text-sm font-medium flex-1">
          {notification.message}
        </p>

        {/* Close button */}
        <button
          onClick={() => {
            setIsLeaving(true)
            setTimeout(onRemove, 300)
          }}
          className="text-white/40 hover:text-white/60 transition-colors p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const notify = useCallback((type: Notification['type'], message: string, duration?: number) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setNotifications(prev => [...prev, { id, type, message, duration }])
  }, [])

  const success = useCallback((message: string, duration?: number) => notify('success', message, duration), [notify])
  const error = useCallback((message: string, duration?: number) => notify('error', message, duration), [notify])
  const info = useCallback((message: string, duration?: number) => notify('info', message, duration), [notify])
  const warning = useCallback((message: string, duration?: number) => notify('warning', message, duration), [notify])

  return (
    <NotificationContext.Provider value={{ notify, success, error, info, warning }}>
      {children}
      
      {/* Notification container - top right */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {notifications.map(notification => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onRemove={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
