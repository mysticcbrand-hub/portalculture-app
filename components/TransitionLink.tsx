'use client'

import { useState, MouseEvent } from 'react'
import Link from 'next/link'

interface TransitionLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
}

export default function TransitionLink({ href, children, className, external = false }: TransitionLinkProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (external || href.startsWith('http')) {
      e.preventDefault()
      
      // Trigger fade
      setIsTransitioning(true)
      const overlay = document.createElement('div')
      overlay.className = 'fixed inset-0 bg-black z-[9999] pointer-events-none'
      overlay.style.opacity = '0'
      overlay.style.transition = 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)'
      document.body.appendChild(overlay)
      
      // Force reflow
      overlay.offsetHeight
      overlay.style.opacity = '1'
      
      // Navigate after fade completes
      setTimeout(() => {
        window.location.href = href
      }, 700)
    }
    // For internal links, Next.js Link handles navigation
  }

  if (external || href.startsWith('http')) {
    return (
      <a
        href={href}
        onClick={handleClick}
        className={className}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
