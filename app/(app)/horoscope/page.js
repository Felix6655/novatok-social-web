'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, Sparkles, Heart, Briefcase, Smile, Loader2, Bookmark } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { generateReading, saveReading, SIGNS } from '@/lib/horoscope/storage'
import { saveItem, isSaved } from '@/lib/saved/storage'

// Map sign IDs to poster images
const ZODIAC_IMAGES = {
  aries: '/zodiac/aries.jpg',
  taurus: '/zodiac/taurus.jpg',
  gemini: '/zodiac/gemini.jpg',
  cancer: '/zodiac/cancer.jpg',
  leo: '/zodiac/leo.jpg',
  virgo: '/zodiac/virgo.jpg',
  libra: '/zodiac/libra.jpg',
  scorpio: '/zodiac/scorpio.jpg',
  sagittarius: '/zodiac/sagittarius.jpg',
  capricorn: '/zodiac/capricorn.jpg',
  aquarius: '/zodiac/aquarius.jpg',
  pisces: '/zodiac/pisces.jpg',
}

export default function HoroscopePage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [selectedSign, setSelectedSign] = useState('aries')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [reading, setReading] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isReadingSaved, setIsReadingSaved] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if current reading is saved when it changes
  useEffect(() => {
    if (reading) {
      setIsReadingSaved(isSaved('horoscope', reading.id))
    }
  }, [reading])

  const handleGenerate = async () => {
    setIsLoading(true)
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const r = generateReading(selectedSign, selectedDate)
    setReading(r)
    await saveReading(r)
    setIsLoading(false)
    toast({ type: 'success', message: 'Your reading is ready!' })
  }

  const handleSaveReading = () => {
    if (!reading) return
    
    saveItem({
      type: 'horoscope',
      sourceId: reading.id,
      title: `${reading.sign.name} ${reading.sign.symbol} Daily Reading`,
      summary: reading.mood,
      metadata: {
        sign: reading.sign,
        date: reading.date,
        love: reading.love,
        career: reading.career,
        mood: reading.mood,
        luckyNumber: reading.luckyNumber,
        luckyColor: reading.luckyColor
      },
      createdAt: reading.generatedAt
    })
    
    setIsReadingSaved(true)
    toast({ type: 'success', message: 'Saved ✓' })
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
          <Star className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Horoscope</h1>
          <p className="text-sm text-gray-500">Daily cosmic guidance</p>
        </div>
      </div>

      {/* Sign Selector */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
        <p className="text-xs text-gray-500 mb-3">Select your sign</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {SIGNS.map((sign) => (
            <button
              key={sign.id}
              onClick={() => setSelectedSign(sign.id)}
              className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 group ${
                selectedSign === sign.id
                  ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[hsl(0,0%,7%)] scale-[1.02]'
                  : 'hover:scale-[1.02] hover:ring-1 hover:ring-gray-600'
              }`}
            >
              {/* Background Image */}
              <Image
                src={ZODIAC_IMAGES[sign.id]}
                alt={sign.name}
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Dark gradient overlay for text readability */}
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                selectedSign === sign.id
                  ? 'bg-gradient-to-t from-amber-900/80 via-black/40 to-transparent'
                  : 'bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/70'
              }`} />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-2 pb-3">
                <span className={`text-2xl mb-0.5 drop-shadow-lg transition-transform duration-300 ${
                  selectedSign === sign.id ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  {sign.symbol}
                </span>
                <span className={`text-xs font-medium drop-shadow-lg ${
                  selectedSign === sign.id ? 'text-amber-200' : 'text-white/90'
                }`}>
                  {sign.name}
                </span>
              </div>
              
              {/* Selected indicator glow */}
              {selectedSign === sign.id && (
                <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
              )}
            </button>
          ))}
        </div>

        {/* Date Selector */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Date</p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-amber-500 hover:to-orange-500 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Reading the stars...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate Reading</>
          )}
        </button>
      </div>

      {/* Reading Card */}
      {reading && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-gray-800 bg-gradient-to-r from-amber-900/20 to-orange-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{reading.sign.symbol}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{reading.sign.name}</h2>
                  <p className="text-sm text-gray-400">{reading.sign.dates}</p>
                </div>
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
          </div>

          {/* Sections */}
          <div className="p-5 space-y-4">
            {/* Love */}
            <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
              <div className="flex items-center gap-2 text-pink-400 mb-2">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">Love</span>
              </div>
              <p className="text-gray-300 text-sm">{reading.love}</p>
            </div>

            {/* Career */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-medium">Career</span>
              </div>
              <p className="text-gray-300 text-sm">{reading.career}</p>
            </div>

            {/* Mood */}
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Smile className="w-4 h-4" />
                <span className="text-sm font-medium">Mood</span>
              </div>
              <p className="text-gray-300 text-sm">{reading.mood}</p>
            </div>

            {/* Lucky Info */}
            <div className="flex gap-4 pt-4 border-t border-gray-800">
              <div className="flex-1 p-3 rounded-xl bg-gray-800/50 text-center">
                <p className="text-xs text-gray-500">Lucky Number</p>
                <p className="text-lg font-bold text-amber-400">{reading.luckyNumber}</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-gray-800/50 text-center">
                <p className="text-xs text-gray-500">Lucky Color</p>
                <p className="text-lg font-bold text-amber-400">{reading.luckyColor}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
