'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Lightbulb, Bell, MessageCircle, User, Sparkles } from 'lucide-react'
import { ToastProvider } from '@/components/ui/ToastProvider'

const navItems = [
  { href: '/think', label: 'Think', icon: Lightbulb },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function AppLayout({ children }) {
  const pathname = usePathname()

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
