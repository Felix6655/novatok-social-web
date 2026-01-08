'use client'

import { useState, useEffect } from 'react'
import { X, Coins, Clock, Music, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { getRewardsState, getRewardHistory, getDailyProgress, formatTokens, REWARD_CONFIG } from '@/lib/music/rewards'

export default function RewardsModal({ isOpen, onClose }) {
  const [state, setState] = useState(null)
  const [history, setHistory] = useState([])
  const [dailyProgress, setDailyProgress] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setState(getRewardsState())
      setHistory(getRewardHistory())
      setDailyProgress(getDailyProgress())
    }
  }, [isOpen])

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
      <div className="bg-[hsl(0,0%,7%)] rounded-xl border border-gray-800 w-full max-w-md max-h-[80vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Listening Rewards</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
                <span className="text-xs text-gray-400">Today's Progress</span>
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
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex-1 overflow-y-auto max-h-48">
          <div className="px-4 py-2">
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
