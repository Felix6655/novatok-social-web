'use client'

import { useState, useEffect } from 'react'
import { X, Coins, Clock, Music, CheckCircle, AlertCircle, TrendingUp, Bug } from 'lucide-react'
import { getRewardsState, getRewardHistory, getDailyProgress, formatTokens, REWARD_CONFIG, getDebugInfo, getListeningSession } from '@/lib/music/rewards'

export default function RewardsModal({ isOpen, onClose, debugInfo = {} }) {
  const [state, setState] = useState(null)
  const [history, setHistory] = useState([])
  const [dailyProgress, setDailyProgress] = useState(null)
  const [showDebug, setShowDebug] = useState(false)
  const [liveDebug, setLiveDebug] = useState({})

  useEffect(() => {
    if (isOpen) {
      setState(getRewardsState())
      setHistory(getRewardHistory())
      setDailyProgress(getDailyProgress())
    }
  }, [isOpen])

  // Live debug info update
  useEffect(() => {
    if (!isOpen || !showDebug) return
    
    const interval = setInterval(() => {
      const session = getListeningSession()
      const rewards = getRewardsState()
      const daily = getDailyProgress()
      
      setLiveDebug({
        ...debugInfo,
        session,
        rewards,
        daily,
        visibilityState: typeof document !== 'undefined' ? document.visibilityState : 'unknown',
      })
    }, 500)
    
    return () => clearInterval(interval)
  }, [isOpen, showDebug, debugInfo])

  if (!isOpen || !state) return null

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'minute': return Clock
      case 'song_complete': return Music
      default: return Coins
    }
  }

  const getEventLabel = (event) => {
    switch (event.type) {
      case 'minute':
        return `${event.minutes} min${event.minutes > 1 ? 's' : ''} listened`
      case 'song_complete':
        return 'Song completed (80%+)'
      default:
        return 'Reward earned'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[hsl(0,0%,7%)] rounded-xl border border-gray-800 w-full max-w-md max-h-[85vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Listening Rewards</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Debug toggle - only in dev */}
            <button
              onClick={() => setShowDebug(!showDebug)}
              className={`p-1.5 rounded-full transition-colors ${showDebug ? 'text-amber-400 bg-amber-500/20' : 'text-gray-600 hover:text-gray-400'}`}
              title="Toggle Debug Panel"
            >
              <Bug className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-56px)]">
          {/* Debug Panel */}
          {showDebug && (
            <div className="p-3 bg-amber-500/5 border-b border-amber-500/20">
              <p className="text-[10px] font-bold text-amber-400 mb-2 uppercase tracking-wider">🐛 Debug Panel (Dev Only)</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-black/30 rounded p-1.5">
                  <span className="text-gray-500">isPlaying:</span>
                  <span className={`ml-1 ${liveDebug.isPlaying || debugInfo.isPlaying ? 'text-green-400' : 'text-red-400'}`}>
                    {String(liveDebug.isPlaying ?? debugInfo.isPlaying ?? 'N/A')}
                  </span>
                </div>
                <div className="bg-black/30 rounded p-1.5">
                  <span className="text-gray-500">isMuted:</span>
                  <span className={`ml-1 ${(liveDebug.volume ?? debugInfo.volume ?? 1) < 0.01 ? 'text-red-400' : 'text-green-400'}`}>
                    {String((liveDebug.volume ?? debugInfo.volume ?? 1) < 0.01)}
                  </span>
                </div>
                <div className="bg-black/30 rounded p-1.5">
                  <span className="text-gray-500">volume:</span>
                  <span className="ml-1 text-blue-400">
                    {((liveDebug.volume ?? debugInfo.volume ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="bg-black/30 rounded p-1.5">
                  <span className="text-gray-500">visibility:</span>
                  <span className={`ml-1 ${liveDebug.visibilityState === 'visible' ? 'text-green-400' : 'text-red-400'}`}>
                    {liveDebug.visibilityState || 'N/A'}
                  </span>
                </div>
                <div className="bg-black/30 rounded p-1.5">
                  <span className="text-gray-500">activeListenSec:</span>
                  <span className="ml-1 text-purple-400">
                    {liveDebug.session?.accumulatedSeconds ?? debugInfo.accumulatedSeconds ?? 0}s
                  </span>
                </div>
                <div className="bg-black/30 rounded p-1.5">
                  <span className="text-gray-500">minCredited:</span>
                  <span className="ml-1 text-cyan-400">
                    {liveDebug.daily?.minutes ?? dailyProgress?.minutes ?? 0}
                  </span>
                </div>
                <div className="bg-black/30 rounded p-1.5">
                  <span className="text-gray-500">songsCredited:</span>
                  <span className="ml-1 text-pink-400">
                    {liveDebug.daily?.songs ?? dailyProgress?.songs ?? 0}
                  </span>
                </div>
                <div className="bg-black/30 rounded p-1.5">
                  <span className="text-gray-500">capRemaining:</span>
                  <span className="ml-1 text-amber-400">
                    {liveDebug.daily?.remaining ?? dailyProgress?.remaining ?? REWARD_CONFIG.dailyCap}
                  </span>
                </div>
                <div className="bg-black/30 rounded p-1.5 col-span-2">
                  <span className="text-gray-500">lastMinRewarded:</span>
                  <span className="ml-1 text-orange-400">
                    {liveDebug.session?.lastMinuteRewarded ?? debugInfo.lastMinuteRewarded ?? 0}
                  </span>
                  <span className="text-gray-600 ml-2">| trackSec:</span>
                  <span className="ml-1 text-teal-400">
                    {liveDebug.session?.trackListenedSeconds ?? 0}s
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="p-4 border-b border-gray-800/50">
            {/* Total Balance */}
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-white">
                {formatTokens(state.totalTokens)}
                <span className="text-amber-400 ml-1">🪙</span>
              </p>
              <p className="text-xs text-gray-500">Total Tokens Earned</p>
            </div>

            {/* Daily Progress */}
            {dailyProgress && (
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Today&apos;s Progress</span>
                  <span className="text-xs text-gray-500">
                    {dailyProgress.earned} / {dailyProgress.cap} tokens
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${dailyProgress.progress}%` }}
                  />
                </div>
                {dailyProgress.earned >= dailyProgress.cap && (
                  <p className="text-[10px] text-amber-400 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Daily cap reached! Come back tomorrow.
                  </p>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="bg-gray-800/30 rounded-lg p-2 text-center">
                <p className="text-lg font-semibold text-white">{state.lifetimeMinutes || 0}</p>
                <p className="text-[10px] text-gray-500">Minutes</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-2 text-center">
                <p className="text-lg font-semibold text-white">{state.songsCompleted || 0}</p>
                <p className="text-[10px] text-gray-500">Songs</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-2 text-center">
                <p className="text-lg font-semibold text-white">{state.todayTokensEarned || 0}</p>
                <p className="text-[10px] text-gray-500">Today</p>
              </div>
            </div>
          </div>

          {/* How to Earn */}
          <div className="px-4 py-3 border-b border-gray-800/50 bg-gray-800/20">
            <p className="text-xs font-medium text-gray-400 mb-2">How to Earn</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <Clock className="w-3 h-3 text-purple-400" />
                <span>+{REWARD_CONFIG.tokensPerMinute} token per minute of listening</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <Music className="w-3 h-3 text-green-400" />
                <span>+{REWARD_CONFIG.songCompletionBonus} tokens per song (80%+ listened)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>Daily cap: {REWARD_CONFIG.dailyCap} tokens (resets at midnight)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-red-400/70 mt-2">
                <AlertCircle className="w-3 h-3" />
                <span>No rewards if muted, paused, or tab hidden</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="px-4 py-3">
            <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Recent Activity
            </p>
            
            {history.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-600">No rewards yet</p>
                <p className="text-[10px] text-gray-700">Start listening to earn tokens!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {history.slice(0, 20).map((event, index) => {
                  const Icon = getEventIcon(event.type)
                  return (
                    <div 
                      key={index}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-800/30 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-gray-500" />
                      <span className="flex-1 text-xs text-gray-400 truncate">
                        {getEventLabel(event)}
                      </span>
                      <span className="text-xs font-medium text-amber-400">+{event.tokens}</span>
                      <span className="text-[10px] text-gray-600">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
