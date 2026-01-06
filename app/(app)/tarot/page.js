'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, RotateCcw, Bookmark } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { generateReading, saveReading, SPREAD_OPTIONS } from '@/lib/tarot/storage'
import { saveItem, isSaved } from '@/lib/saved/storage'

export default function TarotPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [question, setQuestion] = useState('')
  const [selectedSpread, setSelectedSpread] = useState('1-card')
  const [reading, setReading] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isReadingSaved, setIsReadingSaved] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if current reading is saved when it changes
  useEffect(() => {
    if (reading) {
      setIsReadingSaved(isSaved('tarot', reading.id))
    }
  }, [reading])

  const handleDraw = async () => {
    if (!question.trim()) {
      toast({ type: 'error', message: 'Enter a question first' })
      return
    }
    
    setIsLoading(true)
    
    // Simulate shuffling/drawing animation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const r = generateReading(question, selectedSpread)
    setReading(r)
    await saveReading(r)
    setIsLoading(false)
    toast({ type: 'success', message: 'Your cards have been drawn' })
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-800/50 rounded-2xl" />
        <div className="h-64 bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
          <Sparkles className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Tarot / AI Psychic</h1>
          <p className="text-sm text-gray-500">Seek guidance from the cards</p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
        {/* Question Input */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 block mb-2">What do you want guidance on?</label>
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
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <><RotateCcw className="w-5 h-5 animate-spin" /> Shuffling cards...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Draw Cards</>
          )}
        </button>
      </div>

      {/* Reading Card */}
      {reading && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
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
            <div className="flex items-center gap-2 text-violet-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Overall Guidance</span>
            </div>
            <p className="text-gray-300">{reading.overallInterpretation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
