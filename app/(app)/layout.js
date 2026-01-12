'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Lightbulb, Bell, MessageCircle, User, Sparkles, Loader2, AlertTriangle,
  Brain, Star, Heart, Bot, AlarmClock, Video, Settings, LogOut,
  ChevronDown, Users, CalendarDays, Bookmark, Image, MessageSquare, Home, Play, Layout, Globe, Music, Wand2
} from 'lucide-react'
import { ToastProvider, useToast } from '@/components/ui/ToastProvider'
import ReminderPopup from '@/components/ReminderPopup'
import { supabase, getSession, signOut } from '@/lib/supabase/client'
import { isDevelopment } from '@/lib/supabase/health'
import ConstellationBackground from '@/components/ui/ConstellationBackground'
import Footer from '@/components/Footer'

// Sidebar navigation structure
const sidebarSections = [
  {
    id: 'core',
    label: 'Core',
    collapsible: false,
    items: [
      { href: '/home', label: 'Home', icon: Home },
      { href: '/reels', label: 'Reels', icon: Play },
      { href: '/rooms', label: 'Rooms', icon: Layout },
      { href: '/music', label: 'NovaTok Music', icon: Music },
      { href: '/think', label: 'Think', icon: Lightbulb },
      { href: '/thinking', label: 'Thinking', icon: Brain },
      { href: '/soulmate', label: 'SoulMate', icon: Heart },
      { href: '/messages', label: 'Messages', icon: MessageCircle },
      { href: '/notifications', label: 'Notifications', icon: Bell },
    ]
  },
  {
    id: 'create',
    label: 'Create & AI',
    collapsible: true,
    items: [
      { href: '/live', label: 'Go Live', icon: Video },
      { href: '/tarot', label: 'Tarot / AI Psychic', icon: Sparkles },
      { href: '/horoscope', label: 'Horoscope', icon: Star },
      { href: '/ai', label: 'Chat with AIs', icon: MessageSquare },
    ]
  },
  {
    id: 'tools',
    label: 'Tools',
    collapsible: true,
    items: [
      { href: '/savebot', label: 'SaveBot', icon: Bot },
      { href: '/reminders', label: 'Reminders', icon: AlarmClock },
      { href: '/memories', label: 'Memories', icon: Image },
      { href: '/saved', label: 'Saved', icon: Bookmark },
    ]
  },
  {
    id: 'community',
    label: 'Community',
    collapsible: true,
    items: [
      { href: '/groups', label: 'Groups', icon: Users },
      { href: '/events', label: 'Events', icon: CalendarDays },
    ]
  },
]

// Account section items
const accountItems = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
]

// Mobile nav shows fewer items (unchanged)
const mobileNavItems = [
  { href: '/think', label: 'Think', icon: Lightbulb },
  { href: '/thinking', label: 'Thinking', icon: Brain },
  { href: '/soulmate', label: 'SoulMate', icon: Heart },
  { href: '/notifications', label: 'Alerts', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
]

// Sidebar Section Component
function SidebarSection({ section, pathname, expandedSections, toggleSection }) {
  const isExpanded = expandedSections[section.id]
  const hasActiveItem = section.items.some(item => pathname === item.href)
  
  return (
    <div className="mb-2">
      {section.collapsible ? (
        <button
          onClick={() => toggleSection(section.id)}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 hover:bg-gray-800/30 ${
            hasActiveItem ? 'text-purple-400' : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          <span>{section.label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
        </button>
      ) : (
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          {section.label}
        </div>
      )}
      
      <div className={`sidebar-section-content ${!section.collapsible || isExpanded ? 'expanded' : 'collapsed'}`}>
        <ul className="space-y-0.5 mt-1">
          {section.items.map((item, idx) => {
            const isActive = !item.isExternal && pathname === item.href
            const Icon = item.icon
            
            // Shared styling for both internal and external links
            const linkClassName = `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
              isActive
                ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`
            
            const linkContent = (
              <>
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-purple-400' : ''}`} />
                <span className="text-sm font-medium truncate">{item.label}</span>
              </>
            )
            
            return (
              <li 
                key={item.href}
                style={{ animationDelay: `${idx * 30}ms` }}
                className={isExpanded ? 'animate-fade-in' : ''}
              >
                {item.isExternal ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClassName}
                  >
                    {linkContent}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className={linkClassName}
                  >
                    {linkContent}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

// Main Sidebar Component
function Sidebar({ pathname }) {
  const router = useRouter()
  const { toast } = useToast()
  const [expandedSections, setExpandedSections] = useState({
    create: true,
    tools: true,
    community: false,
  })
  const [isSigningOut, setIsSigningOut] = useState(false)

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      toast({ type: 'success', message: 'Signed out successfully' })
      router.push('/login')
    } catch (error) {
      toast({ type: 'error', message: 'Failed to sign out' })
      setIsSigningOut(false)
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[hsl(0,0%,5%)] border-r border-gray-800 fixed h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Sparkles className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            NovaTok
          </span>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-hide">
        {sidebarSections.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            pathname={pathname}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        ))}
      </nav>

      {/* Account Section */}
      <div className="p-3 border-t border-gray-800">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Account
        </div>
        <ul className="space-y-0.5 mt-1">
          {accountItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
          {/* Sign Out */}
          <li>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSigningOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              )}
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default function AppLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [configError, setConfigError] = useState(null)

  useEffect(() => {
    checkAuth()

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
    if (!supabase) {
      if (isDevelopment()) {
        console.warn('[DEV MODE] Supabase not configured - allowing access with localStorage fallback')
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }
      
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

  // Production configuration error
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

  // Not authenticated
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
      {/* Premium Constellation Background - behind all content */}
      <ConstellationBackground />
      
      <div className="min-h-screen flex flex-col relative" style={{ zIndex: 1 }}>
        <div className="flex flex-1">
          {/* Desktop Sidebar */}
          <Sidebar pathname={pathname} />

          {/* Main Content */}
          <main className="flex-1 md:ml-64 pb-20 md:pb-0">
            <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
              {children}
            </div>
          </main>
        </div>

        {/* Site-wide Footer - hidden on mobile (mobile has bottom nav) */}
        <div className="hidden md:block md:ml-64">
          <Footer />
        </div>

        {/* Mobile Bottom Navigation (unchanged) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[hsl(0,0%,5%)] border-t border-gray-800 px-1 py-1.5 z-50">
          <ul className="flex justify-around items-center">
            {mobileNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'text-purple-400'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-purple-400 animate-scale-in" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
      
      {/* Global Reminder Popup */}
      <ReminderPopup />
    </ToastProvider>
  )
}
