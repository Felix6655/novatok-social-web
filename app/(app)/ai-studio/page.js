'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Wand2, 
  Sparkles, 
  Download, 
  Share2, 
  History, 
  Trash2, 
  RefreshCw,
  ChevronRight,
  AlertCircle,
  Image as ImageIcon,
  Video,
  Copy,
  Check,
  Play,
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

// New architecture imports
import { Loading, Empty, ErrorDisplay } from '@/src/components/common'
import { 
  generateImage, 
  downloadImage, 
  shareImage, 
  copyImageUrl,
  postToReels,
  checkAiStatus 
} from '@/src/services/aiStudio'
import { 
  getHistory, 
  saveGeneration, 
  deleteGeneration, 
  generateId,
  STYLE_PRESETS, 
  SIZE_PRESETS 
} from '@/lib/ai-studio/storage'

export default function AIStudioPage() {
  const { toast } = useToast()
  
  // UI State
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('image') // 'image' | 'video' (video coming later)
  const [showHistory, setShowHistory] = useState(false)
  
  // Generation State
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('none')
  const [selectedSize, setSelectedSize] = useState('square')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  
  // History State
  const [history, setHistory] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  
  // API Status
  const [apiStatus, setApiStatus] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Initialize and load history (async)
  useEffect(() => {
    setMounted(true)
    
    // Load history asynchronously
    async function loadHistory() {
      setIsLoadingHistory(true)
      try {
        const savedHistory = await getHistory()
        setHistory(savedHistory)
      } catch (err) {
        console.error('[AI Studio] Failed to load history:', err)
      } finally {
        setIsLoadingHistory(false)
      }
    }
    
    loadHistory()
    
    // Check API status
    checkAiStatus()
      .then(setApiStatus)
      .catch(err => {
        console.warn('[AI Studio] API status check failed:', err)
        setApiStatus({ status: 'not_configured' })
      })
  }, [])

  // Refresh history helper
  const refreshHistory = useCallback(async () => {
    try {
      const savedHistory = await getHistory()
      setHistory(savedHistory)
    } catch (err) {
      console.error('[AI Studio] Failed to refresh history:', err)
    }
  }, [])

  // Generate image
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({ type: 'error', message: 'Please enter a prompt' })
      return
    }
    
    setIsGenerating(true)
    setError(null)
    setResult(null)
    
    const generationId = generateId()
    
    try {
      const response = await generateImage({
        prompt: prompt.trim(),
        style: selectedStyle,
        size: selectedSize,
        negativePrompt: negativePrompt.trim(),
      })
      
      // Save to history
      const record = {
        id: generationId,
        type: 'image',
        prompt: response.prompt,
        enhancedPrompt: response.enhancedPrompt,
        style: response.style,
        size: response.size,
        resultUrl: response.imageUrl,
        model: response.model,
        status: 'completed',
        createdAt: response.generatedAt,
      }
      
      await saveGeneration(record)
      await refreshHistory()
      setResult(record)
      
      toast({ type: 'success', message: 'Image generated!' })
    } catch (err) {
      console.error('[AI Studio] Generation error:', err)
      setError(err)
      
      // Save failed attempt to history
      await saveGeneration({
        id: generationId,
        type: 'image',
        prompt: prompt.trim(),
        style: selectedStyle,
        size: selectedSize,
        status: 'failed',
        error: err.message,
        createdAt: new Date().toISOString(),
      })
      await refreshHistory()
      
      toast({ type: 'error', message: err.message || 'Failed to generate image' })
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, selectedStyle, selectedSize, negativePrompt, toast, refreshHistory])

  // Download handler (cross-platform)
  const handleDownload = useCallback(async () => {
    if (!result?.resultUrl) return
    
    try {
      const { success } = await downloadImage(result.resultUrl, `novatok-ai-${result.id}`)
      if (success) {
        toast({ type: 'success', message: 'Download started!' })
      } else {
        toast({ type: 'error', message: 'Download failed' })
      }
    } catch (err) {
      toast({ type: 'error', message: 'Failed to download' })
    }
  }, [result, toast])

  // Share handler (cross-platform)
  const handleShare = useCallback(async () => {
    if (!result?.resultUrl) return
    
    try {
      const { success, method } = await shareImage(result.resultUrl, 'Check out my AI creation!')
      if (success) {
        if (method === 'clipboard') {
          toast({ type: 'success', message: 'Image URL copied!' })
        } else {
          toast({ type: 'success', message: 'Shared!' })
        }
      }
    } catch (err) {
      toast({ type: 'error', message: 'Failed to share' })
    }
  }, [result, toast])

  // Copy prompt
  const handleCopyPrompt = useCallback(async (text, id) => {
    try {
      const { success } = await copyImageUrl(text)
      if (success) {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      }
    } catch (err) {
      toast({ type: 'error', message: 'Failed to copy' })
    }
  }, [toast])

  // Load from history
  const handleLoadFromHistory = useCallback((item) => {
    setPrompt(item.prompt || '')
    setSelectedStyle(item.style || 'none')
    setSelectedSize(item.size || 'square')
    if (item.status === 'completed' && item.resultUrl) {
      setResult(item)
    }
    setShowHistory(false)
  }, [])

  // Delete from history (async)
  const handleDeleteFromHistory = useCallback(async (id, e) => {
    e.stopPropagation()
    await deleteGeneration(id)
    await refreshHistory()
    if (result?.id === id) {
      setResult(null)
    }
    toast({ type: 'success', message: 'Deleted' })
  }, [result, toast, refreshHistory])

  // Post to Reels (cross-platform using pendingPost store)
  const handlePostToReels = useCallback(async () => {
    if (!result?.resultUrl) return
    
    try {
      await postToReels({
        imageUrl: result.resultUrl,
        prompt: result.prompt,
      })
      
      toast({ type: 'success', message: 'Opening Reels...' })
      
      // Navigate to Reels
      window.location.href = '/reels?upload=ai'
    } catch (err) {
      toast({ type: 'error', message: 'Failed to prepare post' })
    }
  }, [result, toast])

  // Loading state
  if (!mounted) {
    return (
      <div className="space-y-6">
        <Loading variant="skeleton" count={3} />
      </div>
    )
  }

  const isApiReady = apiStatus?.status === 'ready'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/30">
            <Wand2 className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">AI Studio</h1>
            <p className="text-sm text-gray-500">Create with AI-powered generation</p>
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

      {/* API Status Warning */}
      {apiStatus && !isApiReady && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-200 font-medium">AI Service Not Configured</p>
            <p className="text-amber-400/80 text-sm mt-1">
              Set REPLICATE_API_TOKEN in your environment to enable AI generation.
            </p>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
          <h3 className="text-sm font-medium text-white mb-3">Generation History</h3>
          
          {isLoadingHistory ? (
            <Loading variant="skeleton" count={2} />
          ) : history.length === 0 ? (
            <Empty 
              icon={ImageIcon}
              title="No generations yet"
              description="Your AI creations will appear here."
              size="sm"
            />
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.slice(0, 20).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLoadFromHistory(item)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors text-left group"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-gray-900 overflow-hidden flex-shrink-0">
                    {item.status === 'completed' && item.resultUrl ? (
                      <img 
                        src={item.resultUrl} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.status === 'failed' ? (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {item.prompt?.substring(0, 50) || 'No prompt'}{item.prompt?.length > 50 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        item.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDeleteFromHistory(item.id, e)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </div>
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
          title="Generation Failed"
          onRetry={handleGenerate}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'image'
              ? 'bg-violet-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Image
        </button>
        <button
          onClick={() => setActiveTab('video')}
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-800/50 text-gray-600 cursor-not-allowed"
        >
          <Video className="w-4 h-4" />
          Video
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-500">Soon</span>
        </button>
      </div>

      {/* Generation Form */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5 space-y-5">
        {/* Prompt Input */}
        <div>
          <label className="text-xs text-gray-500 block mb-2">Describe what you want to create</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A majestic dragon flying over a crystal castle at sunset, epic fantasy scene..."
            className="w-full h-28 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
            maxLength={1000}
            disabled={isGenerating}
          />
          <p className="text-xs text-gray-600 text-right mt-1">{prompt.length}/1000</p>
        </div>

        {/* Negative Prompt (collapsible) */}
        <details className="group">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 transition-colors">
            Advanced: Negative prompt (optional)
          </summary>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="blurry, low quality, distorted, ugly..."
            className="w-full h-16 mt-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none text-sm"
            maxLength={500}
            disabled={isGenerating}
          />
        </details>

        {/* Style Selector */}
        <div>
          <label className="text-xs text-gray-500 block mb-2">Style</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                disabled={isGenerating}
                className={`p-2 rounded-xl text-center transition-all ${
                  selectedStyle === style.id
                    ? 'bg-violet-600 text-white ring-2 ring-violet-400 ring-offset-2 ring-offset-[hsl(0,0%,7%)]'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                } disabled:opacity-50`}
              >
                <span className="block text-xs font-medium truncate">{style.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Size Selector */}
        <div>
          <label className="text-xs text-gray-500 block mb-2">Size</label>
          <div className="flex gap-2 flex-wrap">
            {SIZE_PRESETS.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size.id)}
                disabled={isGenerating}
                className={`px-3 py-2 rounded-xl transition-all ${
                  selectedSize === size.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                } disabled:opacity-50`}
              >
                <span className="text-xs font-medium">{size.name}</span>
                <span className="text-[10px] text-gray-500 ml-1">({size.ratio})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !isApiReady || !prompt.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Image</span>
            </>
          )}
        </button>
      </div>

      {/* Result Display */}
      {result && result.status === 'completed' && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
          {/* Image Preview */}
          <div className="relative aspect-square max-h-[500px] bg-gray-900">
            <img
              src={result.resultUrl}
              alt={result.prompt}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Info & Actions */}
          <div className="p-5 space-y-4">
            {/* Prompt Display */}
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Prompt</p>
                <p className="text-sm text-gray-300">{result.prompt}</p>
              </div>
              <button
                onClick={() => handleCopyPrompt(result.prompt, result.id)}
                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                {copiedId === result.id ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Metadata */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-gray-400">
                {STYLE_PRESETS.find(s => s.id === result.style)?.name || 'No Style'}
              </span>
              <span className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-gray-400">
                {SIZE_PRESETS.find(s => s.id === result.size)?.name || 'Square'}
              </span>
              <span className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-gray-400">
                {result.model?.split('/').pop() || 'flux'}
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handlePostToReels}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-500 hover:to-purple-500 transition-colors"
              >
                <Play className="w-4 h-4" />
                Post to Reels
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State when no result */}
      {!result && !isGenerating && !error && (
        <Empty
          icon={ImageIcon}
          title="Ready to create"
          description="Enter a prompt above and click Generate to create AI art."
        />
      )}
    </div>
  )
}
