'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, AlertTriangle } from 'lucide-react'

export default function GlobalNotFound() {
  const router = useRouter()
  
  useEffect(() => {
    // Auto-redirect after delay
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
        The page you're looking for doesn't exist or has been moved.
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
