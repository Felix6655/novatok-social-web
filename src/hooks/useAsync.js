'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ApiError, ErrorCodes } from '@/src/services/api'

/**
 * Custom hook for handling async operations with loading/error/data states
 * 
 * Features:
 * - Automatic loading state management
 * - Standardized error handling
 * - Abort on unmount to prevent memory leaks
 * - Optional auto-execute on mount
 * 
 * @param {Function} asyncFn - The async function to execute
 * @param {Object} options - Configuration options
 */
export function useAsync(asyncFn, options = {}) {
  const {
    immediate = false, // Execute immediately on mount
    onSuccess = null,   // Callback on success
    onError = null,     // Callback on error
  } = options

  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: false,
  })

  // Track mounted state
  const mountedRef = useRef(true)
  const lastCallIdRef = useRef(0)

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  /**
   * Execute the async function
   */
  const execute = useCallback(
    async (...args) => {
      // Increment call ID to handle race conditions
      const callId = ++lastCallIdRef.current

      setState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const result = await asyncFn(...args)

        // Only update if this is the latest call and component is mounted
        if (callId === lastCallIdRef.current && mountedRef.current) {
          setState({ data: result, error: null, isLoading: false })
          onSuccess?.(result)
        }

        return result
      } catch (error) {
        // Normalize error
        const normalizedError = error instanceof ApiError
          ? error
          : new ApiError(
              error.message || 'An error occurred',
              0,
              ErrorCodes.UNKNOWN
            )

        // Only update if this is the latest call and component is mounted
        if (callId === lastCallIdRef.current && mountedRef.current) {
          setState({ data: null, error: normalizedError, isLoading: false })
          onError?.(normalizedError)
        }

        throw normalizedError
      }
    },
    [asyncFn, onSuccess, onError]
  )

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false })
  }, [])

  /**
   * Set data manually (useful for optimistic updates)
   */
  const setData = useCallback((data) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  // Auto-execute on mount if immediate is true
  // Note: This is intentional - we only want to run once on mount
  useEffect(() => {
    if (immediate) {
      execute() // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    execute,
    reset,
    setData,
    isIdle: !state.isLoading && !state.error && !state.data,
  }
}

export default useAsync
