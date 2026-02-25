'use client'

import { useEffect, useRef } from 'react'

export default function HapticsProvider() {
  const labelRef = useRef<HTMLLabelElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const trigger = () => {
      if (typeof window === 'undefined') return
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate(8)
          return
        }
      } catch {}
      // iOS fallback: programmatic label click for hidden switch input
      labelRef.current?.click()
    }

    ;(window as any).__haptic = trigger
  }, [])

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: 1, height: 1, opacity: 0 }} aria-hidden="true">
      <input ref={inputRef} id="ios-haptic-switch" type="checkbox" switch="" />
      <label ref={labelRef} htmlFor="ios-haptic-switch">h</label>
    </div>
  )
}
