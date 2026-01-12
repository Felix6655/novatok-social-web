'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Heart, X, Star, Settings, Loader2, Users, Sparkles, 
  RefreshCw, MessageCircle, ChevronLeft, Send, Trash2,
  User, MapPin, Check, AlertCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import {
  getProfile,
  saveProfile,
  loadCandidates,
  getUnswipedCandidates,
  refreshCandidates,
  recordSwipe,
  getMatches,
  deleteMatch,
  getMessages,
  sendMessage,
  getStats,
  resetAllData,
  AVAILABLE_INTERESTS,
  LOOKING_FOR_OPTIONS
} from '@/src/services/soulMatch'

// ==========================================
// Profile Setup Component
// ==========================================
function ProfileSetup({ onSave, t }) {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [ageMin, setAgeMin] = useState(18)
  const [ageMax, setAgeMax] = useState(40)
  const [interests, setInterests] = useState([])
  const [location, setLocation] = useState('')
  const [lookingFor, setLookingFor] = useState('friendship')
  const [isSaving, setIsSaving] = useState(false)

  const toggleInterest = (interest) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : prev.length < 10 ? [...prev, interest] : prev
    )
  }

  const handleSave = async () => {
    if (!displayName.trim()) return
    setIsSaving(true)
    try {
      const profile = await saveProfile({
        displayName,
        bio,
        ageRange: { min: ageMin, max: ageMax },
        interests,
        location,
        lookingFor
      })
      onSave(profile)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 mx-auto mb-4 flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">{t('soulMatch.setupTitle')}</h2>
        <p className="text-gray-400 text-sm mt-1">{t('soulMatch.setupDesc')}</p>
      </div>

      {/* Display Name */}
      <div>
        <label className="text-sm font-medium text-gray-400 block mb-2">
          {t('soulMatch.displayName')} *
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t('soulMatch.displayNamePlaceholder')}
          maxLength={50}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="text-sm font-medium text-gray-400 block mb-2">
          {t('soulMatch.bio')}
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t('soulMatch.bioPlaceholder')}
          maxLength={200}
          rows={3}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 resize-none"
        />
        <p className="text-xs text-gray-600 text-right mt-1">{bio.length}/200</p>
      </div>

      {/* Age Range */}
      <div>
        <label className="text-sm font-medium text-gray-400 block mb-2">
          {t('soulMatch.ageRange')}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={ageMin}
            onChange={(e) => setAgeMin(Math.max(18, parseInt(e.target.value) || 18))}
            min={18}
            max={99}
            className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500/50"
          />
          <span className="text-gray-500">{t('soulMatch.to')}</span>
          <input
            type="number"
            value={ageMax}
            onChange={(e) => setAgeMax(Math.min(99, parseInt(e.target.value) || 50))}
            min={18}
            max={99}
            className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-pink-500/50"
          />
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="text-sm font-medium text-gray-400 block mb-2">
          {t('soulMatch.interests')} ({interests.length}/10)
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_INTERESTS.map(interest => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                interests.includes(interest)
                  ? 'bg-pink-500/30 text-pink-300 border border-pink-500/50'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-sm font-medium text-gray-400 block mb-2">
          {t('soulMatch.location')} ({t('soulMatch.optional')})
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t('soulMatch.locationPlaceholder')}
          maxLength={100}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
        />
      </div>

      {/* Looking For */}
      <div>
        <label className="text-sm font-medium text-gray-400 block mb-2">
          {t('soulMatch.lookingFor')}
        </label>
        <div className="flex gap-2">
          {LOOKING_FOR_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => setLookingFor(option.id)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                lookingFor === option.id
                  ? 'bg-pink-500/30 text-pink-300 border border-pink-500/50'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {t(`soulMatch.lookingForOptions.${option.id}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!displayName.trim() || isSaving}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Check className="w-5 h-5" />
        )}
        {t('soulMatch.saveProfile')}
      </button>
    </div>
  )
}

// ==========================================
// Candidate Card Component
// ==========================================
function CandidateCard({ candidate, onLike, onPass, onSuperLike, isAnimating, t }) {
  return (
    <div className={`bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden transition-all duration-300 ${
      isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
    }`}>
      {/* Avatar Header */}
      <div className={`h-48 ${candidate.avatarColor} flex items-center justify-center relative`}>
        <span className="text-7xl">{candidate.emoji}</span>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
            {candidate.name}, {candidate.age}
          </h3>
          {candidate.location && (
            <p className="text-white/80 text-sm flex items-center gap-1 drop-shadow">
              <MapPin className="w-3 h-3" />
              {candidate.location}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <p className="text-gray-300">{candidate.bio}</p>

        {/* Interests */}
        <div className="flex flex-wrap gap-2">
          {candidate.interests.map(interest => (
            <span
              key={interest}
              className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 text-xs"
            >
              {interest}
            </span>
          ))}
        </div>

        {/* Looking For Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{t('soulMatch.lookingFor')}:</span>
          <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-xs">
            {t(`soulMatch.lookingForOptions.${candidate.lookingFor}`)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-5 pt-0 flex items-center justify-center gap-4">
        <button
          onClick={() => onPass(candidate)}
          className="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center transition-all hover:scale-110"
          title={t('soulMatch.pass')}
        >
          <X className="w-7 h-7 text-gray-400" />
        </button>

        <button
          onClick={() => onSuperLike(candidate)}
          className="w-14 h-14 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 flex items-center justify-center transition-all hover:scale-110"
          title={t('soulMatch.superLike')}
        >
          <Star className="w-6 h-6 text-blue-400" />
        </button>

        <button
          onClick={() => onLike(candidate)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-pink-500/30"
          title={t('soulMatch.like')}
        >
          <Heart className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  )
}

// ==========================================
// Match Modal Component
// ==========================================
function MatchModal({ match, onClose, onMessage, t }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-pink-900/50 to-rose-900/50 border border-pink-500/30 rounded-2xl max-w-sm w-full p-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-pink-500/20 animate-ping" />
          </div>
          <div className={`w-24 h-24 rounded-full ${match.candidateColor} mx-auto flex items-center justify-center relative z-10`}>
            <span className="text-5xl">{match.candidateEmoji}</span>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mt-6">{t('soulMatch.itsAMatch')}</h2>
        <p className="text-pink-300 mt-2">
          {t('soulMatch.matchedWith', { name: match.candidateName })}
        </p>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
          >
            {t('soulMatch.keepSwiping')}
          </button>
          <button
            onClick={() => onMessage(match)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium hover:from-pink-500 hover:to-rose-500 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            {t('soulMatch.sendMessage')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Matches List Component
// ==========================================
function MatchesList({ matches, onSelectMatch, onDeleteMatch, onBack, t }) {
  if (matches.length === 0) {
    return (
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-800 mx-auto mb-4 flex items-center justify-center">
          <Heart className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{t('soulMatch.noMatches')}</h3>
        <p className="text-gray-400 text-sm">{t('soulMatch.noMatchesDesc')}</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2.5 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 font-medium hover:bg-pink-500/30 transition-colors"
        >
          {t('soulMatch.keepSwiping')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {matches.map(match => (
        <div
          key={match.id}
          className="bg-[hsl(0,0%,7%)] rounded-xl border border-gray-800 p-4 flex items-center gap-4 hover:border-gray-700 transition-colors"
        >
          <button
            onClick={() => onSelectMatch(match)}
            className="flex-1 flex items-center gap-4"
          >
            <div className={`w-14 h-14 rounded-full ${match.candidateColor} flex items-center justify-center`}>
              <span className="text-2xl">{match.candidateEmoji}</span>
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-semibold text-white">{match.candidateName}</h4>
              <p className="text-gray-500 text-sm line-clamp-1">{match.candidateBio}</p>
            </div>
            <MessageCircle className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={() => onDeleteMatch(match.id)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ==========================================
// Chat View Component
// ==========================================
function ChatView({ match, onBack, t }) {
  const { toast } = useToast()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 3000) // Poll for new messages
    return () => clearInterval(interval)
  }, [match.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    const msgs = await getMessages(match.id)
    setMessages(msgs)
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return
    
    const content = inputValue.trim()
    setInputValue('')
    setIsSending(true)
    
    try {
      await sendMessage(match.id, content)
      await loadMessages()
    } catch (error) {
      toast({ type: 'error', message: t('soulMatch.sendFailed') })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div className={`w-10 h-10 rounded-full ${match.candidateColor} flex items-center justify-center`}>
          <span className="text-xl">{match.candidateEmoji}</span>
        </div>
        <div>
          <h4 className="font-semibold text-white">{match.candidateName}</h4>
          <p className="text-xs text-gray-500">{t('soulMatch.matched')}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-sm">{t('soulMatch.startConversation')}</p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-pink-500/30 text-pink-100 rounded-br-md'
                  : 'bg-gray-800 text-gray-200 rounded-bl-md'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('soulMatch.typeMessage')}
            maxLength={500}
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-500 hover:to-rose-500 transition-colors disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Main SoulMatch Page
// ==========================================
export default function SoulMatchPage() {
  const { toast } = useToast()
  const { t } = useTranslation()

  // State
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matches, setMatches] = useState([])
  const [stats, setStats] = useState({ likes: 0, passes: 0, superlikes: 0, matches: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const [showMatch, setShowMatch] = useState(null)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [view, setView] = useState('swipe') // 'swipe' | 'matches' | 'chat'
  const [showSettings, setShowSettings] = useState(false)

  // Initialize
  useEffect(() => {
    setMounted(true)
    initializeData()
  }, [])

  const initializeData = async () => {
    setIsLoading(true)
    try {
      const [userProfile, userMatches, userStats] = await Promise.all([
        getProfile(),
        getMatches(),
        getStats()
      ])
      
      setProfile(userProfile)
      setMatches(userMatches)
      setStats(userStats)
      
      if (userProfile) {
        const unswipedCandidates = await getUnswipedCandidates()
        setCandidates(unswipedCandidates)
      }
    } catch (error) {
      console.error('Init error:', error)
      toast({ type: 'error', message: t('common.error') })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSave = async (savedProfile) => {
    setProfile(savedProfile)
    toast({ type: 'success', message: t('soulMatch.profileSaved') })
    
    // Load candidates after profile is set
    const unswipedCandidates = await getUnswipedCandidates()
    setCandidates(unswipedCandidates)
  }

  const handleSwipe = async (candidate, action) => {
    if (isAnimating) return
    
    setIsAnimating(true)
    
    try {
      const result = await recordSwipe(candidate.id, action)
      
      // Update stats
      const newStats = await getStats()
      setStats(newStats)
      
      // Show appropriate toast
      if (result.isMatch) {
        setShowMatch(result.match)
        setMatches(await getMatches())
      } else if (action === 'like') {
        toast({ type: 'success', message: t('soulMatch.liked') })
      } else if (action === 'superlike') {
        toast({ type: 'info', message: t('soulMatch.superLiked') })
      }
      
      // Move to next candidate
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        setIsAnimating(false)
      }, 200)
      
    } catch (error) {
      console.error('Swipe error:', error)
      setIsAnimating(false)
    }
  }

  const handleRefreshPool = async () => {
    setIsLoading(true)
    try {
      await refreshCandidates()
      const newCandidates = await getUnswipedCandidates()
      setCandidates(newCandidates)
      setCurrentIndex(0)
      setStats(await getStats())
      toast({ type: 'success', message: t('soulMatch.poolRefreshed') })
    } catch (error) {
      toast({ type: 'error', message: t('common.error') })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMatch = async (matchId) => {
    await deleteMatch(matchId)
    setMatches(await getMatches())
    setStats(await getStats())
    toast({ type: 'info', message: t('soulMatch.matchDeleted') })
  }

  const handleResetAll = async () => {
    await resetAllData()
    setProfile(null)
    setCandidates([])
    setMatches([])
    setCurrentIndex(0)
    setStats({ likes: 0, passes: 0, superlikes: 0, matches: 0 })
    setShowSettings(false)
    toast({ type: 'success', message: t('soulMatch.dataReset') })
  }

  const currentCandidate = candidates[currentIndex]

  if (!mounted || isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-gray-800/50 rounded-xl w-48" />
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
            <h1 className="text-lg font-semibold text-white">{t('soulMatch.title')}</h1>
            <p className="text-sm text-gray-500">
              {profile ? t('soulMatch.findConnections') : t('soulMatch.setupRequired')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Stats */}
          {profile && (
            <div className="hidden sm:flex items-center gap-3 mr-2 text-sm">
              <span className="text-gray-500">
                <Heart className="w-4 h-4 inline mr-1 text-pink-400" />
                {stats.likes}
              </span>
              <span className="text-gray-500">
                <Users className="w-4 h-4 inline mr-1 text-green-400" />
                {stats.matches}
              </span>
            </div>
          )}
          
          {/* Matches Button */}
          {profile && (
            <button
              onClick={() => setView(view === 'matches' ? 'swipe' : 'matches')}
              className={`p-3 rounded-xl transition-colors relative ${
                view === 'matches' ? 'bg-pink-500/20 border border-pink-500/30' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <MessageCircle className={`w-5 h-5 ${view === 'matches' ? 'text-pink-400' : 'text-gray-400'}`} />
              {matches.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
                  {matches.length}
                </span>
              )}
            </button>
          )}
          
          {/* Settings Button */}
          {profile && (
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {!profile ? (
        // Profile Setup
        <ProfileSetup onSave={handleProfileSave} t={t} />
      ) : view === 'chat' && selectedMatch ? (
        // Chat View
        <ChatView
          match={selectedMatch}
          onBack={() => {
            setSelectedMatch(null)
            setView('matches')
          }}
          t={t}
        />
      ) : view === 'matches' ? (
        // Matches List
        <MatchesList
          matches={matches}
          onSelectMatch={(match) => {
            setSelectedMatch(match)
            setView('chat')
          }}
          onDeleteMatch={handleDeleteMatch}
          onBack={() => setView('swipe')}
          t={t}
        />
      ) : (
        // Swipe View
        <>
          {candidates.length === 0 || currentIndex >= candidates.length ? (
            // Empty State
            <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-800 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('soulMatch.noMoreCandidates')}</h3>
              <p className="text-gray-400 text-sm mb-4">{t('soulMatch.noMoreCandidatesDesc')}</p>
              <button
                onClick={handleRefreshPool}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium hover:from-pink-500 hover:to-rose-500 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {t('soulMatch.refreshPool')}
              </button>
            </div>
          ) : currentCandidate ? (
            <>
              <CandidateCard
                candidate={currentCandidate}
                onLike={(c) => handleSwipe(c, 'like')}
                onPass={(c) => handleSwipe(c, 'pass')}
                onSuperLike={(c) => handleSwipe(c, 'superlike')}
                isAnimating={isAnimating}
                t={t}
              />
              
              {/* Progress */}
              <div className="text-center text-xs text-gray-500">
                {t('soulMatch.candidate')} {currentIndex + 1} {t('soulMatch.of')} {candidates.length}
              </div>
            </>
          ) : null}
        </>
      )}

      {/* Match Modal */}
      {showMatch && (
        <MatchModal
          match={showMatch}
          onClose={() => setShowMatch(null)}
          onMessage={(match) => {
            setShowMatch(null)
            setSelectedMatch(match)
            setView('chat')
          }}
          t={t}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[hsl(0,0%,7%)] border border-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-gray-400" />
              <h2 className="text-xl font-bold text-white">{t('soulMatch.settings')}</h2>
            </div>

            {/* Profile Info */}
            <div className="p-4 rounded-xl bg-gray-800/50 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{profile.displayName}</p>
                  <p className="text-sm text-gray-500">{profile.lookingFor}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="text-center p-3 rounded-lg bg-gray-800/50">
                <p className="text-lg font-bold text-pink-400">{stats.likes}</p>
                <p className="text-xs text-gray-500">{t('soulMatch.likes')}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-800/50">
                <p className="text-lg font-bold text-gray-400">{stats.passes}</p>
                <p className="text-xs text-gray-500">{t('soulMatch.passes')}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-800/50">
                <p className="text-lg font-bold text-blue-400">{stats.superlikes}</p>
                <p className="text-xs text-gray-500">{t('soulMatch.superLikes')}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-800/50">
                <p className="text-lg font-bold text-green-400">{stats.matches}</p>
                <p className="text-xs text-gray-500">{t('soulMatch.matchesCount')}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleRefreshPool}
                disabled={isLoading}
                className="w-full py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {t('soulMatch.refreshPool')}
              </button>
              
              <button
                onClick={handleResetAll}
                className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t('soulMatch.resetAllData')}
              </button>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium hover:from-pink-500 hover:to-rose-500 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
