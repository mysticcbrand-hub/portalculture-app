'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTransition() {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    // Trigger fade out on route change
    setIsTransitioning(true)
    
    const timeout = setTimeout(() => {
      setIsTransitioning(false)
    }, 500) // 500ms fade duration

    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <div
      className={`fixed inset-0 bg-black pointer-events-none z-[9999] transition-opacity duration-500 ${
        isTransitioning ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    />
  )
}
