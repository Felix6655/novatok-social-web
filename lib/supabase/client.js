// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fail loudly if env vars are missing
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set!')
  console.error('Please add it to your .env.local file')
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!')
  console.error('Please add it to your .env.local file')
}

// Create Supabase client (will be null if env vars missing)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null

/**
 * Get current authenticated user
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
export async function getCurrentUser() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Get current session
 * @returns {Promise<import('@supabase/supabase-js').Session | null>}
 */
export async function getSession() {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Sign out the current user
 */
export async function signOut() {
  if (!supabase) return { error: new Error('Supabase not configured') }
  return await supabase.auth.signOut()
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(email, password) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  return await supabase.auth.signInWithPassword({ email, password })
}

/**
 * Sign up with email and password
 */
export async function signUpWithPassword(email, password) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  return await supabase.auth.signUp({ email, password })
}

/**
 * Sign in with magic link (OTP)
 */
export async function signInWithMagicLink(email) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  return await supabase.auth.signInWithOtp({ 
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/think`
    }
  })
}
