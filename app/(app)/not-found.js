/**
 * App-Level Not Found Handler (app/(app)/not-found.js)
 * 
 * WHEN THIS TRIGGERS:
 * - Only when Next.js cannot find a matching route within the (app) group
 * - When notFound() is explicitly called from a page/component in this group
 * - Navigation to non-existent paths under the authenticated app layout
 * 
 * WHEN THIS DOES NOT TRIGGER:
 * - Valid routes (e.g., /home, /music, /soulmate) - they have page.js files
 * - Valid routes with query params (e.g., /music?tab=liked) - route still matches
 * - Valid routes with hash (e.g., /home#feed) - route still matches  
 * - Dynamic routes that exist (e.g., /u/[username]) - handled by dynamic route
 * - Redirected aliases (e.g., /go-live, /chat-with-ais) - redirect in next.config.js runs first
 * - API routes - handled separately
 * 
 * ROUTING ORDER (Next.js evaluates in this order):
 * 1. next.config.js redirects (e.g., /go-live -> /live)
 * 2. Static routes (exact matches like /home, /music)
 * 3. Dynamic routes (e.g., /u/[username])
 * 4. Catch-all routes (if any)
 * 5. not-found.js (only if nothing above matches)
 * 
 * The auto-redirect is safe because this component only renders
 * AFTER Next.js has exhausted all possible route matches.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, AlertTriangle } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

export default function NotFound() {
  const router = useRouter()
  const { toast } = useToast()
  
  useEffect(() => {
    // Show toast notification - confirms this is a real 404
    toast({ type: 'info', message: 'Page not found. Redirecting to Home...' })
    
    // Auto-redirect after a short delay
    // This only runs on true 404s - Next.js routing has already failed to match
    const timeout = setTimeout(() => {
      router.push('/home')
    }, 2000)
    
    return () => clearTimeout(timeout)
  }, [router, toast])
  
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        You&apos;ll be redirected to Home shortly.
      </p>
      
      <Link
        href="/home"
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
      >
        <Home className="w-5 h-5" />
        Go to Home
      </Link>
    </div>
  )
}
