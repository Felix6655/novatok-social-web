'use client'

import { Loader2 } from 'lucide-react'

/**
 * Shared Loading Component
 * 
 * Variants:
 * - 'spinner': Simple spinning loader (default)
 * - 'skeleton': Skeleton placeholder blocks
 * - 'dots': Animated dots
 * - 'pulse': Pulsing animation
 */
export function Loading({
  variant = 'spinner',
  size = 'md',
  message = null,
  className = '',
  count = 3, // For skeleton variant
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  }

  const containerClasses = {
    sm: 'py-2',
    md: 'py-4',
    lg: 'py-8',
    xl: 'py-12',
  }

  if (variant === 'skeleton') {
    return (
      <div className={`space-y-4 animate-pulse ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-800/50 rounded-lg w-3/4" />
            <div className="h-4 bg-gray-800/50 rounded-lg w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-1 ${containerClasses[size]} ${className}`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
        {message && <span className="ml-3 text-sm text-gray-400">{message}</span>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
        <div className={`${sizeClasses[size]} bg-violet-500/30 rounded-full animate-pulse`} />
        {message && <p className="mt-2 text-sm text-gray-400">{message}</p>}
      </div>
    )
  }

  // Default: spinner
  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-violet-400 animate-spin`} />
      {message && <p className="mt-2 text-sm text-gray-400">{message}</p>}
    </div>
  )
}

/**
 * Full-page loading overlay
 */
export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-violet-400 animate-spin" />
        <p className="mt-4 text-white font-medium">{message}</p>
      </div>
    </div>
  )
}

/**
 * Inline loading spinner for buttons or small areas
 */
export function LoadingInline({ size = 'sm', className = '' }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  }

  return <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
}

export default Loading
