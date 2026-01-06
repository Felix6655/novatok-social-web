'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Mail, Lock, ArrowRight, Loader2, Wand2, AlertTriangle, CheckCircle } from 'lucide-react'
import { signInWithPassword, signUpWithPassword, signInWithMagicLink, supabase } from '@/lib/supabase/client'
import { checkSupabase, getConfigStatus, isDevelopment } from '@/lib/supabase/health'
import { ToastProvider, useToast } from '@/components/ui/ToastProvider'

function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = useState('login') // 'login', 'signup', 'magic'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [healthStatus, setHealthStatus] = useState(null)
  const [isCheckingHealth, setIsCheckingHealth] = useState(true)

  // Check Supabase health on mount
  useEffect(() => {
    async function checkHealth() {
      const status = await checkSupabase()
      setHealthStatus(status)
      setIsCheckingHealth(false)
    }
    checkHealth()
  }, [])

  const configStatus = getConfigStatus()
  const isConfigured = configStatus.configured
  const isDevMode = isDevelopment()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isConfigured) {
      toast({ type: 'error', message: 'Supabase not configured. Check your environment variables.' })
      return
    }

    if (!email.trim()) {
      toast({ type: 'error', message: 'Please enter your email' })
      return
    }

    if (mode !== 'magic' && !password.trim()) {
      toast({ type: 'error', message: 'Please enter your password' })
      return
    }

    setIsLoading(true)

    try {
      let result

      if (mode === 'magic') {
        result = await signInWithMagicLink(email)
        if (result.error) throw result.error
        toast({ type: 'success', message: 'Magic link sent! Check your email.' })
        setIsLoading(false)
        return
      }

      if (mode === 'signup') {
        result = await signUpWithPassword(email, password)
        if (result.error) throw result.error
        toast({ type: 'success', message: 'Account created! Check your email to confirm.' })
        setMode('login')
        setIsLoading(false)
        return
      }

      // Login mode
      result = await signInWithPassword(email, password)
      if (result.error) throw result.error
      
      toast({ type: 'success', message: 'Welcome back!' })
      router.push('/think')
      
    } catch (error) {
      toast({ type: 'error', message: error.message || 'Authentication failed' })
    } finally {
      setIsLoading(false)
    }
  }

  // Development mode bypass
  const handleDevBypass = () => {
    if (isDevMode && !isConfigured) {
      toast({ type: 'info', message: 'Entering development mode with localStorage' })
      router.push('/think')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            NovaTok
          </h1>
        </div>

        {/* Card */}
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-1">
              {mode === 'signup' ? 'Create Account' : mode === 'magic' ? 'Magic Link' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-500">
              {mode === 'signup' 
                ? 'Join the NovaTok community'
                : mode === 'magic'
                ? 'We\'ll send you a sign-in link'
                : 'Sign in to continue to NovaTok'
              }
            </p>
          </div>

          {/* Health Status Indicator */}
          {!isCheckingHealth && (
            <div className={`mb-4 p-3 rounded-xl text-sm flex items-start gap-3 ${
              healthStatus?.ok 
                ? 'bg-green-900/20 border border-green-500/30 text-green-300'
                : 'bg-red-900/20 border border-red-500/30 text-red-300'
            }`}>
              {healthStatus?.ok ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium">
                  {healthStatus?.ok ? 'Connected to Supabase' : 'Supabase Not Configured'}
                </p>
                {!healthStatus?.ok && (
                  <p className="text-xs mt-1 opacity-80">
                    {configStatus.message}
                  </p>
                )}
                {isDevMode && !healthStatus?.ok && (
                  <p className="text-xs mt-1 text-amber-400">
                    Development mode: localStorage fallback available
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password - only show for login/signup */}
            {mode !== 'magic' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isConfigured}
              className={`
                w-full py-3.5 rounded-xl font-semibold text-white
                flex items-center justify-center gap-2
                transition-all duration-200 ease-out
                active:scale-[0.98]
                ${isLoading || !isConfigured
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/25'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{mode === 'magic' ? 'Sending...' : mode === 'signup' ? 'Creating...' : 'Signing in...'}</span>
                </>
              ) : (
                <>
                  {mode === 'magic' ? <Wand2 className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                  <span>{mode === 'magic' ? 'Send Magic Link' : mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Dev Mode Bypass */}
          {isDevMode && !isConfigured && (
            <button
              onClick={handleDevBypass}
              className="w-full mt-3 py-2.5 rounded-xl border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/10 transition-colors"
            >
              Continue in Dev Mode (localStorage)
            </button>
          )}

          {/* Mode switchers */}
          <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
            {mode !== 'magic' && isConfigured && (
              <button
                type="button"
                onClick={() => setMode('magic')}
                className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-medium hover:bg-gray-800/50 transition-colors flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Sign in with Magic Link
              </button>
            )}
            
            <p className="text-center text-sm text-gray-500">
              {mode === 'signup' ? (
                <>Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-purple-400 hover:text-purple-300">Sign in</button>
                </>
              ) : (
                <>Don&apos;t have an account?{' '}
                  <button onClick={() => setMode('signup')} className="text-purple-400 hover:text-purple-300">Sign up</button>
                </>
              )}
            </p>
            
            {mode === 'magic' && (
              <button
                onClick={() => setMode('login')}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-400"
              >
                ← Back to password sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ToastProvider>
      <LoginForm />
    </ToastProvider>
  )
}
