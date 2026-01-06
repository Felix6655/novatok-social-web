'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Bell, Shield, Palette, Globe, HelpCircle, ChevronRight } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

export default function SettingsPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSettingClick = (setting) => {
    toast({ type: 'info', message: `${setting} settings coming soon` })
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-gray-800/50 rounded-xl w-48" />
        <div className="h-64 bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }

  const settingGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Settings', desc: 'Edit your profile information' },
        { icon: Shield, label: 'Privacy & Security', desc: 'Manage your privacy settings' },
        { icon: Bell, label: 'Notifications', desc: 'Configure notification preferences' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Palette, label: 'Appearance', desc: 'Theme and display options' },
        { icon: Globe, label: 'Language & Region', desc: 'Language and location settings' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', desc: 'Get help and support' },
      ]
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500/20 to-slate-500/20 flex items-center justify-center border border-gray-500/30">
          <Settings className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account</p>
        </div>
      </div>

      {/* Settings Groups */}
      {settingGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-sm font-medium text-gray-400">{group.title}</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {group.items.map((item, itemIdx) => {
              const Icon = item.icon
              return (
                <button
                  key={itemIdx}
                  onClick={() => handleSettingClick(item.label)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-800/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Version Info */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-600">NovaTok Social Web v1.0</p>
      </div>
    </div>
  )
}
