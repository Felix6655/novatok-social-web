'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, RotateCcw, Bookmark, History, ChevronRight, HelpCircle } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { generateReading, saveReading, getHistory, SPREAD_OPTIONS } from '@/lib/tarot/storage'
import { saveItem, isSaved } from '@/lib/saved/storage'

// Shared UI components from new /src architecture
import { Loading, Empty, ErrorDisplay } from '@/src/components/common'
import { useLocalStorage } from '@/src/hooks'

export default function TarotPage() {
  const { toast } = useToast()
  
  // State
  const [mounted, setMounted] = useState(false)
  const [question, setQuestion] = useState('')
  const [selectedSpread, setSelectedSpread] = useLocalStorage('novatok_tarot_spread', '1-card')
  const [reading, setReading] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isReadingSaved, setIsReadingSaved] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  // Initialize on mount
  useEffect(() => {
    setMounted(true)
    // Load history from localStorage
    const savedHistory = getHistory()
    setHistory(savedHistory)
  }, [])

  // Check if current reading is saved when it changes
  useEffect(() => {
    if (reading) {
      setIsReadingSaved(isSaved('tarot', reading.id))
    }
  }, [reading])

  // Draw cards handler
  const handleDraw = useCallback(async () => {
    if (!question.trim()) {
      toast({ type: 'error', message: 'Enter a question first' })
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate shuffling/drawing animation (will be replaced with real API in Phase 2)
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const r = generateReading(question, selectedSpread)
      setReading(r)
      await saveReading(r)
      
      // Update local history state
      setHistory(getHistory())
      
      toast({ type: 'success', message: 'Your cards have been drawn' })
    } catch (err) {
      setError({
        message: err.message || 'Failed to draw cards',
        code: 'DRAW_ERROR'
      })
      toast({ type: 'error', message: 'Failed to draw cards' })
    } finally {
      setIsLoading(false)
    }
  }, [question, selectedSpread, toast])

  // Save reading to saved items
  const handleSaveReading = useCallback(() => {
    if (!reading) return
    
    try {
      const cardNames = reading.cards.map(c => c.name).join(', ')
      const spreadLabel = reading.spread === '3-card' ? 'Past/Present/Future' : 'Single Card'
      
      saveItem({
        type: 'tarot',
        sourceId: reading.id,
        title: `Tarot Reading: ${spreadLabel}`,
        summary: reading.question.length > 100 
          ? reading.question.substring(0, 97) + '...'
          : reading.question,
        metadata: {
          question: reading.question,
          cards: reading.cards,
          cardNames,
          spread: reading.spread,
          overallInterpretation: reading.overallInterpretation
        },
        createdAt: reading.generatedAt
      })
      
      setIsReadingSaved(true)
      toast({ type: 'success', message: 'Saved ✓' })
    } catch (err) {
      toast({ type: 'error', message: 'Failed to save reading' })
    }
  }, [reading, toast])

  // Load reading from history
  const handleLoadFromHistory = useCallback((historyReading) => {
    setReading(historyReading)
    setQuestion(historyReading.question)
    setSelectedSpread(historyReading.spread)
    setShowHistory(false)
  }, [setSelectedSpread])

  // Clear current reading to start fresh
  const handleNewReading = useCallback(() => {
    setReading(null)
    setQuestion('')
    setError(null)
  }, [])

  // Loading skeleton during SSR
  if (!mounted) {
    return (
      <div className="space-y-6">
        <Loading variant="skeleton" count={3} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Tarot / AI Psychic</h1>
            <p className="text-sm text-gray-500">Seek guidance from the cards</p>
          </div>
        </div>
        
        {/* History Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
            showHistory 
              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700'
          }`}
        >
          <History className="w-4 h-4" />
          History
        </button>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
          <h3 className="text-sm font-medium text-white mb-3">Recent Readings</h3>
          
          {history.length === 0 ? (
            <Empty 
              preset="history" 
              size="sm"
              description="Your reading history will appear here."
            />
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((item, idx) => (
                <button
                  key={item.id || idx}
                  onClick={() => handleLoadFromHistory(item)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      {item.cards.slice(0, 3).map((card, cardIdx) => (
                        <div 
                          key={cardIdx}
                          className={`w-5 h-7 rounded bg-violet-500/30 border border-violet-500/50 ${
                            card.isReversed ? 'rotate-180' : ''
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.question.length > 40 
                          ? item.question.substring(0, 37) + '...' 
                          : item.question}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.cards.length} card{item.cards.length > 1 ? 's' : ''} • {new Date(item.generatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <ErrorDisplay 
          error={error}
          title="Drawing Error"
          onRetry={handleDraw}
        />
      )}

      {/* Input Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
        {/* Question Input */}
        <div className="mb-4">
          <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            What do you want guidance on?
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about love, career, decisions, or anything on your mind..."
            className="w-full h-24 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
            maxLength={200}
          />
          <p className="text-xs text-gray-600 text-right mt-1">{question.length}/200</p>
        </div>

        {/* Spread Selector */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Choose a spread</p>
          <div className="flex gap-2">
            {SPREAD_OPTIONS.map((spread) => (
              <button
                key={spread.id}
                onClick={() => setSelectedSpread(spread.id)}
                className={`flex-1 p-3 rounded-xl text-center transition-all duration-200 ${
                  selectedSpread === spread.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span className="block font-medium">{spread.name}</span>
                <span className="text-xs opacity-70">{spread.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Draw Button */}
        <button
          onClick={handleDraw}
          disabled={isLoading || !question.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <RotateCcw className="w-5 h-5 animate-spin" />
              <span>Shuffling cards...</span>
            </>
          ) : (
            <><Sparkles className="w-5 h-5" /> Draw Cards</>
          )}
        </button>
      </div>

      {/* Empty State - No reading yet */}
      {!reading && !isLoading && (
        <Empty 
          preset="tarot"
          description="Enter a question above and draw cards to receive your guidance."
        />
      )}

      {/* Reading Card - With Content */}
      {reading && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
          {/* Question Recap */}
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Your question:</p>
                <p className="text-sm text-gray-300">{reading.question}</p>
              </div>
              <button
                onClick={handleNewReading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className={`p-5 grid gap-4 ${reading.cards.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {reading.cards.map((card, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 rounded-xl p-4 border border-violet-500/20"
              >
                {card.position && (
                  <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 mb-3 inline-block">
                    {card.position}
                  </span>
                )}
                <h3 className="text-lg font-bold text-white mb-1">
                  {card.name}
                  {card.isReversed && <span className="text-violet-400 text-sm ml-2">(Reversed)</span>}
                </h3>
                <p className="text-sm text-gray-400">{card.interpretation}</p>
              </div>
            ))}
          </div>

          {/* Overall Interpretation */}
          <div className="p-5 bg-gray-900/50 border-t border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-violet-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Overall Guidance</span>
              </div>
              <button
                onClick={handleSaveReading}
                disabled={isReadingSaved}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isReadingSaved
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isReadingSaved ? 'fill-current' : ''}`} />
                {isReadingSaved ? 'Saved' : 'Save'}
              </button>
            </div>
            <p className="text-gray-300">{reading.overallInterpretation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
