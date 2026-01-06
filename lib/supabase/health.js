// Supabase health check utilities
import { supabase, getSession } from './client'

/**
 * Check if running in development mode
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if running in production mode
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check Supabase configuration and connectivity
 * @returns {Promise<{ ok: boolean, message?: string, details?: object }>}
 */
export async function checkSupabase() {
  const result = {
    ok: false,
    message: '',
    details: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      clientCreated: !!supabase,
      environment: process.env.NODE_ENV || 'unknown'
    }
  }

  // Check env vars
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    result.message = 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable'
    return result
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    result.message = 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable'
    return result
  }

  // Check if client was created
  if (!supabase) {
    result.message = 'Supabase client failed to initialize'
    return result
  }

  // Attempt a lightweight call to verify connectivity
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      result.message = `Supabase connection error: ${error.message}`
      return result
    }

    result.ok = true
    result.message = 'Supabase is configured and connected'
    result.details.sessionExists = !!data.session
    return result
    
  } catch (error) {
    result.message = `Supabase health check failed: ${error.message}`
    return result
  }
}

/**
 * Get configuration status for display
 * @returns {{ configured: boolean, devMode: boolean, message: string }}
 */
export function getConfigStatus() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const configured = hasUrl && hasKey && !!supabase
  const devMode = isDevelopment()

  if (configured) {
    return {
      configured: true,
      devMode,
      message: 'Supabase is configured'
    }
  }

  const missing = []
  if (!hasUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!hasKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return {
    configured: false,
    devMode,
    message: `Missing: ${missing.join(', ')}`
  }
}
