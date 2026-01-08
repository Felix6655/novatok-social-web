/**
 * Global Not Found Handler (app/not-found.js)
 * 
 * WHEN THIS TRIGGERS:
 * - Only when Next.js cannot find a matching route at the root level
 * - Routes outside the (app) group that don't exist
 * - Direct navigation to completely invalid URLs
 * 
 * WHEN THIS DOES NOT TRIGGER:
 * - Valid routes with query params (e.g., /home?tab=1) - route still matches
 * - Valid routes with hash fragments (e.g., /home#section) - route still matches
 * - Dynamic segments that exist (e.g., /u/[username]) - handled by dynamic route
 * - Routes inside (app) group - those use their own not-found.js
 * - Redirected routes (e.g., /go-live -> /live) - redirect happens first
 * 
 * The auto-redirect to /home only happens after confirming no route matches.
 * Next.js routing is evaluated BEFORE this handler runs.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, AlertTriangle } from 'lucide-react'

export default function GlobalNotFound() {
  const router = useRouter()
  
  useEffect(() => {
    // Auto-redirect after delay - only runs on true 404s
    // Next.js has already confirmed no route matches before rendering this
    const timeout = setTimeout(() => {
      router.push('/home')
    }, 3000)
    
    return () => clearTimeout(timeout)
  }, [router])
  
  return (
    <div className="min-h-screen bg-[hsl(0,0%,4%)] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Redirecting you to Home in a few seconds...
      </p>
      
      <Link
        href="/home"
        className="flex items-center gap-2 px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
      >
        <Home className="w-5 h-5" />
        Go to Home Now
      </Link>
      
      <p className="text-gray-700 text-sm mt-6">NovaTok Social</p>
    </div>
  )
}
