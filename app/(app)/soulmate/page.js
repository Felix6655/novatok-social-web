'use client'

import { useState, useEffect } from 'react'
import { Heart, X, Star, Dna, Settings, Loader2, Shield, ChevronRight } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { getDnaProfile, saveDnaProfile } from '@/lib/dna/storage'

export default function SoulMatePage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [showDnaModal, setShowDnaModal] = useState(false)
  const [dnaProfile, setDnaProfile] = useState(null)
  const [isSavingDna, setIsSavingDna] = useState(false)
  
  // DNA form state
  const [dnaConsent, setDnaConsent] = useState(false)
  const [dnaProvider, setDnaProvider] = useState('')
  const [dnaKitId, setDnaKitId] = useState('')

  useEffect(() => {
    setMounted(true)
    loadDnaProfile()
  }, [])

  async function loadDnaProfile() {
    const profile = await getDnaProfile()
    setDnaProfile(profile)
  }

  const handleStartMatching = () => {
    toast({ type: 'info', message: 'Matching coming soon' })
  }

  const handleLike = () => {
    toast({ type: 'success', message: 'Liked!' })
  }

  const handlePass = () => {
    toast({ type: 'info', message: 'Passed' })
  }

  const handleSuperLike = () => {
    toast({ type: 'unlock', message: 'Super liked!' })
  }

  const handleSaveDna = async () => {
    if (!dnaConsent) {
      toast({ type: 'error', message: 'Please provide consent to continue' })
      return
    }
    if (!dnaProvider.trim() || !dnaKitId.trim()) {
      toast({ type: 'error', message: 'Please fill in all fields' })
      return
    }

    setIsSavingDna(true)
    try {
      await saveDnaProfile({
        provider: dnaProvider,
        kitId: dnaKitId,
        consent: dnaConsent
      })
      toast({ type: 'success', message: 'DNA profile saved!' })
      setShowDnaModal(false)
      await loadDnaProfile()
    } catch (e) {
      toast({ type: 'error', message: 'Failed to save DNA profile' })
    } finally {
      setIsSavingDna(false)
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-800/50 rounded-2xl" />
        <div className="h-96 bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center border border-pink-500/30">
            <Heart className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">SoulMate</h1>
            <p className="text-sm text-gray-500">Find real connections</p>
          </div>
        </div>
        <button className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors">
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
        {/* Photo placeholder */}
        <div className="h-80 bg-gradient-to-br from-pink-900/30 to-purple-900/30 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <p className="text-gray-400">Profile photos coming soon</p>
            </div>
          </div>
        </div>
        
        {/* Info */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-white">Sample Profile, 28</h2>
              <p className="text-gray-500">5 miles away</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">Online</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Looking for meaningful connections. Love hiking, coffee, and deep conversations.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Music', 'Travel', 'Photography', 'Art'].map((interest) => (
              <span key={interest} className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-sm">
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 pt-0">
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePass}
              className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all hover:scale-110"
            >
              <X className="w-7 h-7 text-gray-400" />
            </button>
            <button
              onClick={handleSuperLike}
              className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all hover:scale-110"
            >
              <Star className="w-7 h-7 text-white" />
            </button>
            <button
              onClick={handleLike}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 flex items-center justify-center transition-all hover:scale-110"
            >
              <Heart className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500">Age Range</label>
            <div className="flex gap-3 mt-1">
              <input type="number" placeholder="18" className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm" />
              <span className="text-gray-500 self-center">to</span>
              <input type="number" placeholder="40" className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Maximum Distance</label>
            <input type="range" className="w-full mt-1" />
            <p className="text-xs text-gray-500 text-right">25 miles</p>
          </div>
        </div>
        <button
          onClick={handleStartMatching}
          className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold hover:from-pink-500 hover:to-rose-500 transition-all"
        >
          Start Matching
        </button>
      </div>

      {/* DNA Compatibility (Optional) */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
              <Dna className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">DNA Compatibility</h3>
              <p className="text-xs text-gray-500">Optional feature</p>
            </div>
          </div>
          {dnaProfile ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">Connected</span>
          ) : (
            <button
              onClick={() => setShowDnaModal(true)}
              className="px-4 py-2 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/10 transition-colors flex items-center gap-1"
            >
              Set Up <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        {dnaProfile && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-400">
              Provider: {dnaProfile.provider} • Kit: {dnaProfile.kitId}
            </p>
          </div>
        )}
      </div>

      {/* DNA Modal */}
      {showDnaModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[hsl(0,0%,7%)] border border-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                <Dna className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">DNA Compatibility</h2>
                <p className="text-sm text-gray-400">Optional feature</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-300">
                  This is completely optional. You can use SoulMate without DNA data. Your genetic information is never shared with matches.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">DNA Provider</label>
                <input
                  type="text"
                  value={dnaProvider}
                  onChange={(e) => setDnaProvider(e.target.value)}
                  placeholder="e.g., 23andMe, AncestryDNA"
                  className="w-full mt-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Kit ID</label>
                <input
                  type="text"
                  value={dnaKitId}
                  onChange={(e) => setDnaKitId(e.target.value)}
                  placeholder="Your kit identifier"
                  className="w-full mt-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dnaConsent}
                  onChange={(e) => setDnaConsent(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-400">
                  I consent to NovaTok using my DNA data for compatibility matching. I understand this is optional and I can delete this data at any time.
                </span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDnaModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDna}
                disabled={isSavingDna}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-500 hover:to-teal-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingDna ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
