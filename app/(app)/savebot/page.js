'use client'

import { useState, useEffect } from 'react'
import { Bot, Send, ShoppingBag, Tag, Store, CheckSquare, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { generateAdvice, saveQuery, QUICK_CATEGORIES } from '@/lib/savebot/storage'

export default function SaveBotPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [checklist, setChecklist] = useState([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAsk = async () => {
    if (!query.trim()) {
      toast({ type: 'error', message: 'Tell me what you\'re looking for!' })
      return
    }
    
    setIsLoading(true)
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const advice = generateAdvice(query)
    setResult(advice)
    setChecklist(advice.checklist)
    await saveQuery(advice)
    setIsLoading(false)
    toast({ type: 'success', message: 'Here are my suggestions!' })
  }

  const handleQuickCategory = (category) => {
    setQuery(`Best deals on ${category.toLowerCase()}`)
  }

  const toggleChecklist = (index) => {
    const newChecklist = [...checklist]
    newChecklist[index].checked = !newChecklist[index].checked
    setChecklist(newChecklist)
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
          <Bot className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">SaveBot</h1>
          <p className="text-sm text-gray-500">Find deals, save money</p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
        <label className="text-xs text-gray-500 block mb-2">What are you trying to buy?</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., new laptop, groceries, baby stroller..."
            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50"
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button
            onClick={handleAsk}
            disabled={isLoading}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {/* Quick Categories */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Quick categories</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleQuickCategory(cat)}
                className="px-3 py-1.5 rounded-full bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 hover:text-gray-300 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Stores Card */}
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 text-green-400 mb-3">
              <Store className="w-4 h-4" />
              <span className="text-sm font-medium">Recommended Stores</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.stores.map((store, idx) => (
                <span key={idx} className="px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                  {store}
                </span>
              ))}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <Tag className="w-4 h-4" />
              <span className="text-sm font-medium">Money-Saving Tips</span>
            </div>
            <ul className="space-y-2">
              {result.tips.map((tip, idx) => (
                <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-green-400">•</span> {tip}
                </li>
              ))}
              <li className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-amber-400">•</span> {result.budgetTip}
              </li>
              <li className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-blue-400">•</span> {result.brandTip}
              </li>
            </ul>
          </div>

          {/* Search Queries Card */}
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 text-blue-400 mb-3">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-sm font-medium">Suggested Searches</span>
            </div>
            <div className="space-y-2">
              {result.searchQueries.map((search, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-300 text-sm">&ldquo;{search}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist Card */}
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 text-purple-400 mb-3">
              <CheckSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Shopping Checklist</span>
            </div>
            <div className="space-y-2">
              {checklist.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleChecklist(idx)}
                  className={`w-full p-3 rounded-xl text-left text-sm flex items-center gap-3 transition-all ${
                    item.checked
                      ? 'bg-green-500/10 border border-green-500/20 text-green-300 line-through'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded border flex items-center justify-center ${
                    item.checked ? 'bg-green-500 border-green-500' : 'border-gray-600'
                  }`}>
                    {item.checked && <span className="text-white text-xs">✓</span>}
                  </span>
                  {item.item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
