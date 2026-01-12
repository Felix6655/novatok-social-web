/**
 * Environment Variable Utilities
 * 
 * Handles proper separation of:
 * - Public variables (NEXT_PUBLIC_*) - safe for client-side
 * - Server-only variables - never exposed to client
 * 
 * Usage:
 * - Client: import { env } from '@/src/utils/env'
 * - Server: import { serverEnv } from '@/src/utils/env'
 */

/**
 * Public environment variables (safe for client-side)
 * All NEXT_PUBLIC_* variables are automatically exposed to the browser
 */
export const env = {
  // App
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // Feature flags (add NEXT_PUBLIC_* vars as needed)
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
}

/**
 * Server-only environment variables
 * These are ONLY available in server components and API routes
 * Never import this in client components!
 */
export const serverEnv = {
  // Database
  mongoUrl: process.env.MONGO_URL,
  dbName: process.env.DB_NAME,
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS || '*',
  
  // AI Provider Keys (Phase 2 - add when needed)
  // openaiApiKey: process.env.OPENAI_API_KEY,
  // anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  
  // External Services (add as needed)
  // supabaseUrl: process.env.SUPABASE_URL,
  // supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  // livekitApiKey: process.env.LIVEKIT_API_KEY,
  // livekitApiSecret: process.env.LIVEKIT_API_SECRET,
}

/**
 * Check if a required env var exists (for server-side validation)
 */
export function requireEnv(key, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/**
 * Get an optional env var with a default
 */
export function getEnvWithDefault(value, defaultValue) {
  return value || defaultValue
}
