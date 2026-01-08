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
    // Show toast notification
    toast({ type: 'info', message: 'Page not found. Redirecting to Home...' })
    
    // Redirect after a short delay
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
        The page you're looking for doesn't exist or has been moved.
        You'll be redirected to Home shortly.
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
