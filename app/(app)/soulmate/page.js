'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Heart, X, Star, Dna, Settings, Loader2, Shield, ChevronRight, RotateCcw, Users, Sparkles, Filter, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { getDnaProfile, saveDnaProfile } from '@/lib/dna/storage'
import { 
  getUnviewedProfiles, 
  recordLike, 
  recordPass, 
  recordSuperLike, 
  getStats,
  getMatches,
  resetAllData,
  loadProfiles as loadAllProfiles
} from '@/lib/soulmate/storage'
import ProfileCard, { ProfileCardSkeleton } from '@/components/soulmate/ProfileCard'
import MatchModal from '@/components/soulmate/MatchModal'

export default function SoulMatePage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [showDnaModal, setShowDnaModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [dnaProfile, setDnaProfile] = useState(null)
  const [isSavingDna, setIsSavingDna] = useState(false)
  
  // Profile browsing state
  const [allProfiles, setAllProfiles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState({ liked: 0, passed: 0, superliked: 0, matches: 0 })
  const [matchedProfile, setMatchedProfile] = useState(null)
  
  // Preferences (apply immediately)
  const [preferences, setPreferences] = useState({
    minAge: 18,
    maxAge: 40,
    maxDistance: 25
  })
  
  // DNA form state
  const [dnaConsent, setDnaConsent] = useState(false)
  const [dnaProvider, setDnaProvider] = useState('')
  const [dnaKitId, setDnaKitId] = useState('')

  useEffect(() => {
    setMounted(true)
    loadDnaProfile()
    loadStats()
  }, [])

  async function loadDnaProfile() {
    const profile = await getDnaProfile()
    setDnaProfile(profile)
  }
  
  function loadStats() {
    setStats(getStats())
  }
  
  // Filtered profiles based on current preferences (computed)
  const filteredProfiles = useMemo(() => {
    return allProfiles.filter(p => {
      if (p.age < preferences.minAge || p.age > preferences.maxAge) return false
      if (p.distanceMiles > preferences.maxDistance) return false
      return true
    })
  }, [allProfiles, preferences])
  
  // Load profiles with skeleton loading
  const loadProfiles = useCallback(async () => {
    setIsLoading(true)
    setIsInitialLoad(true)
    
    // Simulate realistic loading time (500-900ms)
    const loadTime = 500 + Math.random() * 400
    
    await new Promise(resolve => setTimeout(resolve, loadTime))
    
    const unviewed = getUnviewedProfiles({
      minAge: preferences.minAge,
      maxAge: preferences.maxAge,
      maxDistance: preferences.maxDistance
    })
    
    // Shuffle profiles for variety
    const shuffled = [...unviewed].sort(() => Math.random() - 0.5)
    setAllProfiles(shuffled.slice(0, 200)) // Load 200 at a time for performance
    setCurrentIndex(0)
    setIsLoading(false)
    setIsInitialLoad(false)
  }, [preferences])

  const handleStartMatching = () => {
    setHasStarted(true)
    loadProfiles()
  }
  
  // Current profile from filtered list
  const currentProfile = filteredProfiles[currentIndex]
  
  // Check if there are more profiles in the filtered set
  const hasMoreProfiles = currentIndex < filteredProfiles.length - 1
  const noProfilesInSettings = filteredProfiles.length === 0 && allProfiles.length > 0
  const noProfilesAtAll = allProfiles.length === 0 && !isLoading
  
  const moveToNext = useCallback(() => {
    if (currentIndex < filteredProfiles.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // Try to load more
      loadProfiles()
    }
    loadStats()
  }, [currentIndex, filteredProfiles.length, loadProfiles])

  const handleLike = useCallback((profile) => {
    const isMatch = recordLike(profile.id)
    if (isMatch) {
      setMatchedProfile(profile)
      toast({ type: 'success', message: "It's a match! 💕" })
    } else {
      toast({ type: 'success', message: 'Liked!' })
    }
    moveToNext()
  }, [moveToNext, toast])

  const handlePass = useCallback((profile) => {
    recordPass(profile.id)
    toast({ type: 'info', message: 'Passed' })
    moveToNext()
  }, [moveToNext, toast])

  const handleSuperLike = useCallback((profile) => {
    const isMatch = recordSuperLike(profile.id)
    if (isMatch) {
      setMatchedProfile(profile)
      toast({ type: 'success', message: "Super Match! ⭐💕" })
    } else {
      toast({ type: 'unlock', message: 'Super liked! ⭐' })
    }
    moveToNext()
  }, [moveToNext, toast])
  
  const handleCloseMatch = () => {
    setMatchedProfile(null)
  }
  
  const handleMessageMatch = (profile) => {
    setMatchedProfile(null)
    toast({ type: 'info', message: `Messaging ${profile.displayName} coming soon!` })
  }
  
  const handleResetData = () => {
    resetAllData()
    loadStats()
    setCurrentIndex(0)
    setAllProfiles([])
    loadProfiles()
    toast({ type: 'success', message: 'Data reset!' })
    setShowSettingsModal(false)
  }
  
  // Update preferences and immediately re-filter
  const updatePreference = (key, value) => {
    setPreferences(p => ({ ...p, [key]: value }))
    // Reset to first profile when filters change
    setCurrentIndex(0)
  }
  
  const handleRefreshProfiles = () => {
    loadProfiles()
    toast({ type: 'info', message: 'Refreshing profiles...' })
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
        <div className="flex items-center gap-2">
          {hasStarted && (
            <div className="flex items-center gap-3 mr-2 text-sm">
              <span className="text-gray-500">
                <Heart className="w-4 h-4 inline mr-1 text-pink-400" />
                {stats.liked}
              </span>
              <span className="text-gray-500">
                <Users className="w-4 h-4 inline mr-1 text-green-400" />
                {stats.matches}
              </span>
            </div>
          )}
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!hasStarted ? (
        <>
          {/* Welcome / Start Card */}
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-pink-900/30 via-purple-900/20 to-indigo-900/30 relative flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 mx-auto mb-4 flex items-center justify-center shadow-xl shadow-pink-500/30">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Ready to Find Your Match?</h2>
                <p className="text-gray-400 text-sm">
                  Discover 5,000+ profiles waiting to connect with you
                </p>
              </div>
            </div>
            
            <div className="p-5">
              {/* Stats preview */}
              {(stats.liked > 0 || stats.matches > 0) && (
                <div className="flex gap-4 mb-5 p-4 rounded-xl bg-gray-800/50">
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-bold text-pink-400">{stats.liked}</p>
                    <p className="text-xs text-gray-500">Liked</p>
                  </div>
                  <div className="flex-1 text-center border-x border-gray-700">
                    <p className="text-2xl font-bold text-blue-400">{stats.superliked}</p>
                    <p className="text-xs text-gray-500">Super Liked</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-bold text-green-400">{stats.matches}</p>
                    <p className="text-xs text-gray-500">Matches</p>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleStartMatching}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold hover:from-pink-500 hover:to-rose-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
              >
                <Sparkles className="w-5 h-5" />
                Start Matching
              </button>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500">Age Range</label>
                <div className="flex gap-3 mt-1">
                  <input 
                    type="number" 
                    value={preferences.minAge}
                    onChange={(e) => setPreferences(p => ({ ...p, minAge: parseInt(e.target.value) || 18 }))}
                    min="18"
                    max="40"
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50" 
                  />
                  <span className="text-gray-500 self-center">to</span>
                  <input 
                    type="number" 
                    value={preferences.maxAge}
                    onChange={(e) => setPreferences(p => ({ ...p, maxAge: parseInt(e.target.value) || 40 }))}
                    min="18"
                    max="40"
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Maximum Distance: {preferences.maxDistance} miles</label>
                <input 
                  type="range" 
                  min="1"
                  max="50"
                  value={preferences.maxDistance}
                  onChange={(e) => setPreferences(p => ({ ...p, maxDistance: parseInt(e.target.value) }))}
                  className="w-full mt-2 accent-pink-500" 
                />
              </div>
            </div>
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
        </>
      ) : (
        <>
          {/* Inline Filter Bar */}
          <div className="bg-[hsl(0,0%,7%)] rounded-xl border border-gray-800 p-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Filters:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Age</span>
                <input 
                  type="number" 
                  value={preferences.minAge}
                  onChange={(e) => updatePreference('minAge', parseInt(e.target.value) || 18)}
                  min="18" max="40"
                  className="w-14 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-pink-500/50" 
                />
                <span className="text-gray-600">-</span>
                <input 
                  type="number" 
                  value={preferences.maxAge}
                  onChange={(e) => updatePreference('maxAge', parseInt(e.target.value) || 40)}
                  min="18" max="40"
                  className="w-14 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-pink-500/50" 
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Max</span>
                <input 
                  type="number" 
                  value={preferences.maxDistance}
                  onChange={(e) => updatePreference('maxDistance', parseInt(e.target.value) || 25)}
                  min="1" max="50"
                  className="w-14 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-pink-500/50" 
                />
                <span className="text-xs text-gray-400">mi</span>
              </div>
              <button
                onClick={handleRefreshProfiles}
                disabled={isLoading}
                className="ml-auto p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Refresh profiles"
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        
          {/* Profile Browsing */}
          {isInitialLoad ? (
            // Skeleton loading state
            <ProfileCardSkeleton />
          ) : noProfilesInSettings ? (
            // No profiles match current filter settings
            <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 h-[500px] flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 mx-auto mb-4 flex items-center justify-center border border-amber-500/30">
                  <Filter className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Profiles in Your Settings</h3>
                <p className="text-gray-400 text-sm mb-4 max-w-xs mx-auto">
                  Try expanding your age range or distance to see more profiles.
                </p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gray-800/50 text-left">
                    <p className="text-xs text-gray-500 mb-1">Current filters:</p>
                    <p className="text-sm text-gray-300">
                      Ages {preferences.minAge}–{preferences.maxAge} • Within {preferences.maxDistance} miles
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPreferences({ minAge: 18, maxAge: 40, maxDistance: 50 })
                      setCurrentIndex(0)
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium hover:from-amber-500 hover:to-orange-500 transition-colors"
                  >
                    Expand Filters
                  </button>
                </div>
              </div>
            </div>
          ) : noProfilesAtAll ? (
            // No more profiles at all
            <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 h-[500px] flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-16 h-16 rounded-full bg-gray-800 mx-auto mb-4 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You've Seen Everyone!</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Amazing! You've viewed all available profiles. Check back later for new people.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleResetData}
                    className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start Over
                  </button>
                  <button
                    onClick={handleRefreshProfiles}
                    className="px-6 py-3 rounded-xl bg-pink-600 text-white font-medium hover:bg-pink-500 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          ) : currentProfile ? (
            <ProfileCard
              profile={currentProfile}
              onLike={handleLike}
              onPass={handlePass}
              onSuperLike={handleSuperLike}
              isTop={true}
            />
          ) : isLoading ? (
            <ProfileCardSkeleton />
          ) : null}
          
          {/* Progress indicator */}
          {!isLoading && !noProfilesInSettings && !noProfilesAtAll && filteredProfiles.length > 0 && (
            <div className="text-center text-xs text-gray-500">
              Profile {currentIndex + 1} of {filteredProfiles.length}
              {filteredProfiles.length < allProfiles.length && (
                <span className="text-gray-600"> • {allProfiles.length - filteredProfiles.length} filtered out</span>
              )}
            </div>
          )}
        </>
      )}

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
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[hsl(0,0%,7%)] border border-gray-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center border border-gray-600/30">
                <Settings className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <p className="text-sm text-gray-400">Matching preferences</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-sm text-gray-400">Age Range</label>
                <div className="flex gap-3 mt-2">
                  <input 
                    type="number" 
                    value={preferences.minAge}
                    onChange={(e) => updatePreference('minAge', parseInt(e.target.value) || 18)}
                    min="18"
                    max="40"
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50" 
                  />
                  <span className="text-gray-500 self-center">to</span>
                  <input 
                    type="number" 
                    value={preferences.maxAge}
                    onChange={(e) => updatePreference('maxAge', parseInt(e.target.value) || 40)}
                    min="18"
                    max="40"
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50" 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Maximum Distance: {preferences.maxDistance} miles</label>
                <input 
                  type="range" 
                  min="1"
                  max="50"
                  value={preferences.maxDistance}
                  onChange={(e) => updatePreference('maxDistance', parseInt(e.target.value))}
                  className="w-full mt-2 accent-pink-500" 
                />
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Your Stats</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg bg-gray-800/50">
                    <p className="text-lg font-bold text-pink-400">{stats.liked}</p>
                    <p className="text-xs text-gray-500">Liked</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-800/50">
                    <p className="text-lg font-bold text-gray-400">{stats.passed}</p>
                    <p className="text-xs text-gray-500">Passed</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-800/50">
                    <p className="text-lg font-bold text-blue-400">{stats.superliked}</p>
                    <p className="text-xs text-gray-500">Super</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-800/50">
                    <p className="text-lg font-bold text-green-400">{stats.matches}</p>
                    <p className="text-xs text-gray-500">Matches</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <button
                  onClick={handleResetData}
                  className="w-full py-2.5 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All Data
                </button>
                <p className="text-xs text-gray-600 text-center mt-2">
                  This will clear your likes, passes, and matches
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium hover:from-pink-500 hover:to-rose-500 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Match Modal */}
      {matchedProfile && (
        <MatchModal
          profile={matchedProfile}
          onClose={handleCloseMatch}
          onMessage={handleMessageMatch}
        />
      )}
    </div>
  )
}
