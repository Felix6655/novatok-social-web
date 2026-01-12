'use client'

import { AlertCircle, RefreshCw, WifiOff, ShieldX, XCircle } from 'lucide-react'
import { ErrorCodes } from '@/src/services/api'

/**
 * Shared Error Display Component
 * 
 * Features:
 * - Standardized error presentation
 * - Contextual icons based on error type
 * - Optional retry functionality
 * - Collapsible technical details
 */
export function ErrorDisplay({
  error,
  title = 'Something went wrong',
  onRetry = null,
  showDetails = false,
  className = '',
}) {
  // Determine error info
  const errorCode = error?.code || ErrorCodes.UNKNOWN
  const errorMessage = error?.message || 'An unexpected error occurred'
  const errorDetails = error?.details || null

  // Get icon and color based on error type
  const getErrorStyle = () => {
    switch (errorCode) {
      case ErrorCodes.NETWORK_ERROR:
        return {
          icon: WifiOff,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/20',
        }
      case ErrorCodes.TIMEOUT:
        return {
          icon: RefreshCw,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
        }
      case ErrorCodes.UNAUTHORIZED:
      case ErrorCodes.FORBIDDEN:
        return {
          icon: ShieldX,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
        }
      case ErrorCodes.NOT_FOUND:
        return {
          icon: XCircle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
        }
      default:
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
        }
    }
  }

  const style = getErrorStyle()
  const Icon = style.icon

  return (
    <div className={`rounded-xl ${style.bgColor} border ${style.borderColor} p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${style.bgColor}`}>
          <Icon className={`w-5 h-5 ${style.color}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium">{title}</h3>
          <p className="text-gray-400 text-sm mt-1">{errorMessage}</p>
          
          {/* Technical details (collapsible) */}
          {showDetails && errorDetails && (
            <details className="mt-3">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                Technical Details
              </summary>
              <pre className="mt-2 p-2 bg-black/30 rounded text-xs text-gray-500 overflow-auto">
                {typeof errorDetails === 'string' 
                  ? errorDetails 
                  : JSON.stringify(errorDetails, null, 2)}
              </pre>
            </details>
          )}
          
          {/* Retry button */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Compact inline error message
 */
export function ErrorInline({ message, className = '' }) {
  return (
    <div className={`flex items-center gap-2 text-red-400 text-sm ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

/**
 * Error boundary fallback component
 */
export function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <ErrorDisplay
        error={{ message: error?.message, code: ErrorCodes.UNKNOWN }}
        title="Component Error"
        onRetry={resetErrorBoundary}
      />
    </div>
  )
}

export default ErrorDisplay
