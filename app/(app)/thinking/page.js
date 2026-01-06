'use client'

import { useState, useEffect } from 'react'
import { Brain, Sparkles, ChevronRight, CheckCircle, XCircle, Lightbulb, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { generateQuestion, saveSession, TOPIC_LIST, DIFFICULTY_LIST } from '@/lib/thinking/storage'

export default function ThinkingPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('science')
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [question, setQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGenerate = async () => {
    setIsLoading(true)
    setSelectedAnswer(null)
    setIsRevealed(false)
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const q = generateQuestion(selectedTopic, selectedDifficulty)
    setQuestion(q)
    setIsLoading(false)
  }

  const handleReveal = async () => {
    if (selectedAnswer === null) {
      toast({ type: 'error', message: 'Select an answer first!' })
      return
    }
    setIsRevealed(true)
    
    // Save session
    if (question) {
      await saveSession({
        ...question,
        userAnswer: selectedAnswer,
        correct: selectedAnswer === question.correctIndex
      })
    }
    
    if (selectedAnswer === question.correctIndex) {
      toast({ type: 'success', message: 'Correct! Great thinking!' })
    } else {
      toast({ type: 'info', message: 'Not quite - see the explanation below' })
    }
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
          <Brain className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Thinking</h1>
          <p className="text-sm text-gray-500">Sharpen your mind</p>
        </div>
      </div>

      {/* Settings Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
        {/* Topic Selector */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-3">Choose a topic</p>
          <div className="flex flex-wrap gap-2">
            {TOPIC_LIST.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                  selectedTopic === topic
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-3">Difficulty</p>
          <div className="flex gap-2">
            {DIFFICULTY_LIST.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                  selectedDifficulty === diff
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate Question</>
          )}
        </button>
      </div>

      {/* Question Card */}
      {question && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-800">
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400 capitalize">
              {question.topic} • {question.difficulty}
            </span>
            <h2 className="text-lg font-semibold text-white mt-3">{question.question}</h2>
          </div>

          {/* Answers */}
          <div className="p-5 space-y-3">
            {question.answers.map((answer, idx) => {
              let style = 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              let icon = null
              
              if (isRevealed) {
                if (idx === question.correctIndex) {
                  style = 'bg-green-900/30 border-green-500/50 text-green-300'
                  icon = <CheckCircle className="w-5 h-5 text-green-400" />
                } else if (idx === selectedAnswer) {
                  style = 'bg-red-900/30 border-red-500/50 text-red-300'
                  icon = <XCircle className="w-5 h-5 text-red-400" />
                }
              } else if (idx === selectedAnswer) {
                style = 'bg-indigo-600 text-white'
              }
              
              return (
                <button
                  key={idx}
                  onClick={() => !isRevealed && setSelectedAnswer(idx)}
                  disabled={isRevealed}
                  className={`w-full p-4 rounded-xl text-left font-medium flex items-center justify-between border border-transparent transition-all ${style}`}
                >
                  <span>{answer}</span>
                  {icon}
                </button>
              )
            })}
          </div>

          {/* Reveal Button */}
          {!isRevealed && (
            <div className="p-5 pt-0">
              <button
                onClick={handleReveal}
                className="w-full py-3 rounded-xl border border-indigo-500/30 text-indigo-400 font-medium hover:bg-indigo-500/10 transition-colors"
              >
                Reveal Answer
              </button>
            </div>
          )}

          {/* Explanation */}
          {isRevealed && (
            <div className="p-5 bg-gray-900/50 border-t border-gray-800">
              <p className="text-gray-300 mb-4">{question.explanation}</p>
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm font-medium">Why this matters</span>
                </div>
                <p className="text-sm text-gray-400">{question.whyItMatters}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
