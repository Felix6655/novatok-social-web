'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lightbulb, Bell, MessageCircle, User, Sparkles, Loader2, AlertTriangle } from 'lucide-react'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { supabase, getSession } from '@/lib/supabase/client'
import { isDevelopment, isProduction } from '@/lib/supabase/health'

const navItems = [
  { href: '/think', label: 'Think', icon: Lightbulb },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function AppLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [configError, setConfigError] = useState(null)

  useEffect(() => {
    // Check initial session
    checkAuth()

    // Listen for auth state changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/login')
        } else if (event === 'SIGNED_IN') {
          setIsAuthenticated(true)
        }
      })

      return () => subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkAuth() {
    // Check if Supabase is configured
    if (!supabase) {
      // In DEVELOPMENT: Allow fallback mode
      if (isDevelopment()) {
        console.warn('[DEV MODE] Supabase not configured - allowing access with localStorage fallback')
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }
      
      // In PRODUCTION: Show error, do not allow access
      setConfigError({
        title: 'Configuration Error',
        message: 'Supabase is not configured. Please set the following environment variables:',
        vars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
      })
      setIsLoading(false)
      return
    }

    try {
      const session = await getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  // Production configuration error - full page error
  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,3.9%)] p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-300">{configError.title}</h1>
                <p className="text-sm text-red-400/80">Production environment</p>
              </div>
            </div>
            <p className="text-red-200 mb-4">{configError.message}</p>
            <ul className="space-y-2 mb-6">
              {configError.vars.map((v) => (
                <li key={v} className="font-mono text-sm bg-black/30 px-3 py-2 rounded-lg text-red-300">
                  {v}
                </li>
              ))}
            </ul>
            <p className="text-sm text-red-400/60">
              Add these to your deployment environment or .env.local file, then restart the server.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,3.9%)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,3.9%)]">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirecting to login...</span>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-[hsl(0,0%,5%)] border-r border-gray-800 fixed h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                NovaTok
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20">
              <p className="text-sm text-gray-400">NovaTok Social</p>
              <p className="text-xs text-gray-500">Web Version</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[hsl(0,0%,5%)] border-t border-gray-800 px-2 py-2 z-50">
          <ul className="flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'text-purple-400'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </ToastProvider>
  )
}
