'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
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
  Clock,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

// New architecture imports
import { Loading, Empty, ErrorDisplay } from '@/src/components/common'
import { 
  generateImage, 
  downloadImage, 
  downloadVideo,
  shareImage,
  shareVideo,
  copyImageUrl,
  postImageToReels,
  postVideoToReels,
  checkAiStatus,
  checkVideoStatus,
  startVideoGeneration,
  pollVideoUntilComplete,
} from '@/src/services/aiStudio'
import { 
  getHistory, 
  saveGeneration, 
  deleteGeneration, 
  generateId,
  STYLE_PRESETS, 
  SIZE_PRESETS 
} from '@/lib/ai-studio/storage'

// Aspect ratio presets for video
const ASPECT_RATIO_PRESETS = [
  { id: '16:9', name: 'Landscape', ratio: '16:9' },
  { id: '9:16', name: 'Portrait', ratio: '9:16' },
  { id: '1:1', name: 'Square', ratio: '1:1' },
]

// Duration presets (in seconds)
const DURATION_PRESETS = [3, 5, 7]

export default function AIStudioPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  // UI State
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('image')
  const [showHistory, setShowHistory] = useState(false)
  
  // Image Generation State
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('none')
  const [selectedSize, setSelectedSize] = useState('square')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  
  // Video Generation State
  const [videoPrompt, setVideoPrompt] = useState('')
  const [videoNegativePrompt, setVideoNegativePrompt] = useState('')
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9')
  const [selectedDuration, setSelectedDuration] = useState(5)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoStatus, setVideoStatus] = useState('')
  const [videoError, setVideoError] = useState(null)
  const [videoResult, setVideoResult] = useState(null)
  const [currentPredictionId, setCurrentPredictionId] = useState(null)
  const pollingRef = useRef(false)
  
  // History State
  const [history, setHistory] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  
  // API Status
  const [apiStatus, setApiStatus] = useState(null)
  const [videoApiStatus, setVideoApiStatus] = useState(null)
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
    
    // Check API status for images
    checkAiStatus()
      .then(setApiStatus)
      .catch(err => {
        console.warn('[AI Studio] Image API status check failed:', err)
        setApiStatus({ status: 'not_configured' })
      })
    
    // Check API status for video
    checkVideoStatus()
      .then(setVideoApiStatus)
      .catch(err => {
        console.warn('[AI Studio] Video API status check failed:', err)
        setVideoApiStatus({ status: 'not_configured' })
      })

    // Cleanup polling on unmount
    return () => {
      pollingRef.current = false
    }
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

  // ==========================================
  // Image Generation Handlers
  // ==========================================

  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim()) {
      toast({ type: 'error', message: t('aiStudio.promptRequired') })
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
      
      toast({ type: 'success', message: t('aiStudio.imageGenerated') })
    } catch (err) {
      console.error('[AI Studio] Generation error:', err)
      setError(err)
      
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
      
      toast({ type: 'error', message: err.message || t('aiStudio.generationFailed') })
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, selectedStyle, selectedSize, negativePrompt, toast, refreshHistory, t])

  // ==========================================
  // Video Generation Handlers
  // ==========================================

  const handleGenerateVideo = useCallback(async () => {
    if (!videoPrompt.trim()) {
      toast({ type: 'error', message: t('aiStudio.promptRequired') })
      return
    }
    
    setIsGeneratingVideo(true)
    setVideoError(null)
    setVideoResult(null)
    setVideoProgress(0)
    setVideoStatus('starting')
    pollingRef.current = true
    
    const generationId = generateId()
    
    try {
      // Start video generation
      const startResponse = await startVideoGeneration({
        prompt: videoPrompt.trim(),
        negativePrompt: videoNegativePrompt.trim(),
        aspectRatio: selectedAspectRatio,
        durationSeconds: selectedDuration,
      })
      
      setCurrentPredictionId(startResponse.id)
      setVideoStatus('processing')
      
      // Poll until complete
      const finalResult = await pollVideoUntilComplete(
        startResponse.id,
        (status) => {
          if (!pollingRef.current) return
          setVideoProgress(status.progress || 0)
          setVideoStatus(status.status)
        },
        2500, // Poll every 2.5 seconds
        120   // Max 5 minutes
      )
      
      if (!pollingRef.current) return
      
      // Save successful generation
      const record = {
        id: generationId,
        type: 'video',
        prompt: videoPrompt.trim(),
        aspectRatio: selectedAspectRatio,
        duration: selectedDuration,
        resultUrl: finalResult.videoUrl,
        model: finalResult.model,
        status: 'completed',
        createdAt: finalResult.createdAt || new Date().toISOString(),
        metadata: {
          predictionId: startResponse.id,
          metrics: finalResult.metrics,
        },
      }
      
      await saveGeneration(record)
      await refreshHistory()
      setVideoResult(record)
      
      toast({ type: 'success', message: t('aiStudio.videoGenerated') })
    } catch (err) {
      console.error('[AI Studio] Video generation error:', err)
      if (!pollingRef.current) return
      
      setVideoError(err)
      
      await saveGeneration({
        id: generationId,
        type: 'video',
        prompt: videoPrompt.trim(),
        aspectRatio: selectedAspectRatio,
        duration: selectedDuration,
        status: 'failed',
        error: err.message,
        createdAt: new Date().toISOString(),
      })
      await refreshHistory()
      
      toast({ type: 'error', message: err.message || t('aiStudio.videoFailed') })
    } finally {
      setIsGeneratingVideo(false)
      setCurrentPredictionId(null)
      pollingRef.current = false
    }
  }, [videoPrompt, videoNegativePrompt, selectedAspectRatio, selectedDuration, toast, refreshHistory, t])

  // Cancel video generation
  const handleCancelVideo = useCallback(() => {
    pollingRef.current = false
    setIsGeneratingVideo(false)
    setVideoStatus('')
    setVideoProgress(0)
    toast({ type: 'info', message: 'Generation cancelled' })
  }, [toast])

  // ==========================================
  // Shared Handlers
  // ==========================================

  const handleDownload = useCallback(async () => {
    const url = activeTab === 'video' ? videoResult?.resultUrl : result?.resultUrl
    const id = activeTab === 'video' ? videoResult?.id : result?.id
    if (!url) return
    
    try {
      const downloadFn = activeTab === 'video' ? downloadVideo : downloadImage
      const { success } = await downloadFn(url, `novatok-ai-${id}`)
      if (success) {
        toast({ type: 'success', message: t('aiStudio.downloadStarted') })
      } else {
        toast({ type: 'error', message: t('aiStudio.downloadFailed') })
      }
    } catch (err) {
      toast({ type: 'error', message: t('aiStudio.downloadFailed') })
    }
  }, [activeTab, result, videoResult, toast, t])

  const handleShare = useCallback(async () => {
    const url = activeTab === 'video' ? videoResult?.resultUrl : result?.resultUrl
    if (!url) return
    
    try {
      const shareFn = activeTab === 'video' ? shareVideo : shareImage
      const { success, method } = await shareFn(url, 'Check out my AI creation!')
      if (success) {
        toast({ type: 'success', message: method === 'clipboard' ? t('aiStudio.urlCopied') : t('aiStudio.shared') })
      }
    } catch (err) {
      toast({ type: 'error', message: t('aiStudio.shareFailed') })
    }
  }, [activeTab, result, videoResult, toast, t])

  const handleCopyPrompt = useCallback(async (text, id) => {
    try {
      const { success } = await copyImageUrl(text)
      if (success) {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      }
    } catch (err) {
      toast({ type: 'error', message: t('aiStudio.shareFailed') })
    }
  }, [toast, t])

  const handlePostToReels = useCallback(async () => {
    const isVideo = activeTab === 'video'
    const currentResult = isVideo ? videoResult : result
    if (!currentResult?.resultUrl) return
    
    try {
      const postFn = isVideo ? postVideoToReels : postImageToReels
      await postFn({
        [isVideo ? 'videoUrl' : 'imageUrl']: currentResult.resultUrl,
        prompt: currentResult.prompt,
      })
      
      toast({ type: 'success', message: t('aiStudio.openingReels') })
      window.location.href = '/reels?upload=ai'
    } catch (err) {
      toast({ type: 'error', message: t('aiStudio.preparePostFailed') })
    }
  }, [activeTab, result, videoResult, toast, t])

  const handleLoadFromHistory = useCallback((item) => {
    if (item.type === 'video') {
      setActiveTab('video')
      setVideoPrompt(item.prompt || '')
      setSelectedAspectRatio(item.aspectRatio || '16:9')
      setSelectedDuration(item.duration || 5)
      if (item.status === 'completed' && item.resultUrl) {
        setVideoResult(item)
      }
    } else {
      setActiveTab('image')
      setPrompt(item.prompt || '')
      setSelectedStyle(item.style || 'none')
      setSelectedSize(item.size || 'square')
      if (item.status === 'completed' && item.resultUrl) {
        setResult(item)
      }
    }
    setShowHistory(false)
  }, [])

  const handleDeleteFromHistory = useCallback(async (id, e) => {
    e.stopPropagation()
    await deleteGeneration(id)
    await refreshHistory()
    if (result?.id === id) setResult(null)
    if (videoResult?.id === id) setVideoResult(null)
    toast({ type: 'success', message: t('aiStudio.deleted') })
  }, [result, videoResult, toast, refreshHistory, t])

  // Loading state
  if (!mounted) {
    return (
      <div className="space-y-6">
        <Loading variant="skeleton" count={3} />
      </div>
    )
  }

  const isApiReady = apiStatus?.status === 'ready'
  const isVideoApiReady = videoApiStatus?.status === 'ready'
  const currentResult = activeTab === 'video' ? videoResult : result
  const currentError = activeTab === 'video' ? videoError : error

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/30">
            <Wand2 className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">{t('aiStudio.title')}</h1>
            <p className="text-sm text-gray-500">{t('aiStudio.subtitle')}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
            showHistory 
              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700'
          }`}
        >
          <History className="w-4 h-4" />
          {t('aiStudio.history')}
        </button>
      </div>

      {/* API Status Warning */}
      {((activeTab === 'image' && apiStatus && !isApiReady) || 
        (activeTab === 'video' && videoApiStatus && !isVideoApiReady)) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-200 font-medium">{t('aiStudio.notConfigured')}</p>
            <p className="text-amber-400/80 text-sm mt-1">{t('aiStudio.notConfiguredDesc')}</p>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
          <h3 className="text-sm font-medium text-white mb-3">{t('aiStudio.historyTitle')}</h3>
          
          {isLoadingHistory ? (
            <Loading variant="skeleton" count={2} />
          ) : history.length === 0 ? (
            <Empty 
              icon={ImageIcon}
              title={t('aiStudio.noGenerations')}
              description={t('aiStudio.noGenerationsDesc')}
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
                  <div className="w-12 h-12 rounded-lg bg-gray-900 overflow-hidden flex-shrink-0">
                    {item.status === 'completed' && item.resultUrl ? (
                      item.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-violet-500/20">
                          <Video className="w-5 h-5 text-violet-400" />
                        </div>
                      ) : (
                        <img src={item.resultUrl} alt="" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.status === 'failed' ? (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        ) : item.type === 'video' ? (
                          <Video className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {item.prompt?.substring(0, 50) || 'No prompt'}{item.prompt?.length > 50 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        item.type === 'video' ? 'bg-violet-500/20 text-violet-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {item.type === 'video' ? 'Video' : 'Image'}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        item.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
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
      {currentError && (
        <ErrorDisplay 
          error={currentError}
          title={activeTab === 'video' ? t('aiStudio.videoFailed') : t('aiStudio.generationFailed')}
          onRetry={activeTab === 'video' ? handleGenerateVideo : handleGenerateImage}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'image' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          {t('aiStudio.imageTab')}
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'video' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Video className="w-4 h-4" />
          {t('aiStudio.videoTab')}
        </button>
      </div>

      {/* IMAGE GENERATION FORM */}
      {activeTab === 'image' && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5 space-y-5">
          <div>
            <label className="text-xs text-gray-500 block mb-2">{t('aiStudio.promptLabel')}</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('aiStudio.promptPlaceholder')}
              className="w-full h-28 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
              maxLength={1000}
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-600 text-right mt-1">{prompt.length}/1000</p>
          </div>

          <details className="group">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 transition-colors">
              {t('aiStudio.negativePromptLabel')}
            </summary>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder={t('aiStudio.negativePromptPlaceholder')}
              className="w-full h-16 mt-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none text-sm"
              maxLength={500}
              disabled={isGenerating}
            />
          </details>

          <div>
            <label className="text-xs text-gray-500 block mb-2">{t('aiStudio.styleLabel')}</label>
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
                  <span className="block text-xs font-medium truncate">{t(`aiStudio.styles.${style.id}`)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2">{t('aiStudio.sizeLabel')}</label>
            <div className="flex gap-2 flex-wrap">
              {SIZE_PRESETS.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  disabled={isGenerating}
                  className={`px-3 py-2 rounded-xl transition-all ${
                    selectedSize === size.id ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  } disabled:opacity-50`}
                >
                  <span className="text-xs font-medium">{t(`aiStudio.sizes.${size.id}`)}</span>
                  <span className="text-[10px] text-gray-500 ml-1">({size.ratio})</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateImage}
            disabled={isGenerating || !isApiReady || !prompt.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /><span>{t('aiStudio.generating')}</span></>
            ) : (
              <><Sparkles className="w-5 h-5" /><span>{t('aiStudio.generateButton')}</span></>
            )}
          </button>
        </div>
      )}

      {/* VIDEO GENERATION FORM */}
      {activeTab === 'video' && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5 space-y-5">
          <div>
            <label className="text-xs text-gray-500 block mb-2">{t('aiStudio.promptLabel')}</label>
            <textarea
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="A spaceship flying through a colorful nebula, cinematic..."
              className="w-full h-28 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
              maxLength={1000}
              disabled={isGeneratingVideo}
            />
            <p className="text-xs text-gray-600 text-right mt-1">{videoPrompt.length}/1000</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2">{t('aiStudio.aspectRatio')}</label>
            <div className="flex gap-2 flex-wrap">
              {ASPECT_RATIO_PRESETS.map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setSelectedAspectRatio(ar.id)}
                  disabled={isGeneratingVideo}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    selectedAspectRatio === ar.id ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  } disabled:opacity-50`}
                >
                  <span className="text-sm font-medium">{ar.name}</span>
                  <span className="text-xs text-gray-400 ml-2">({ar.ratio})</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2">{t('aiStudio.duration')}</label>
            <div className="flex gap-2">
              {DURATION_PRESETS.map((dur) => (
                <button
                  key={dur}
                  onClick={() => setSelectedDuration(dur)}
                  disabled={isGeneratingVideo}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    selectedDuration === dur ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  } disabled:opacity-50`}
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  <span className="text-sm">{dur}s</span>
                </button>
              ))}
            </div>
          </div>

          {/* Video Progress Bar */}
          {isGeneratingVideo && (
            <div className="bg-gray-900 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 capitalize">{videoStatus || 'Starting'}...</span>
                <span className="text-sm text-violet-400">{Math.round(videoProgress)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all duration-500"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
              <button
                onClick={handleCancelVideo}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            onClick={handleGenerateVideo}
            disabled={isGeneratingVideo || !isVideoApiReady || !videoPrompt.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingVideo ? (
              <><Loader2 className="w-5 h-5 animate-spin" /><span>{t('aiStudio.videoGenerating')}</span></>
            ) : (
              <><Video className="w-5 h-5" /><span>{t('aiStudio.generateVideo')}</span></>
            )}
          </button>
        </div>
      )}

      {/* RESULT DISPLAY */}
      {currentResult && currentResult.status === 'completed' && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="relative aspect-video max-h-[500px] bg-gray-900">
            {currentResult.type === 'video' ? (
              <video
                src={currentResult.resultUrl}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={currentResult.resultUrl}
                alt={currentResult.prompt}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{t('aiStudio.prompt')}</p>
                <p className="text-sm text-gray-300">{currentResult.prompt}</p>
              </div>
              <button
                onClick={() => handleCopyPrompt(currentResult.prompt, currentResult.id)}
                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                {copiedId === currentResult.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-gray-400">
                {currentResult.type === 'video' ? 'Video' : t(`aiStudio.styles.${currentResult.style}`) || t('aiStudio.styles.none')}
              </span>
              {currentResult.type === 'video' && currentResult.aspectRatio && (
                <span className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-gray-400">
                  {currentResult.aspectRatio}
                </span>
              )}
              {currentResult.type !== 'video' && (
                <span className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-gray-400">
                  {t(`aiStudio.sizes.${currentResult.size}`) || t('aiStudio.sizes.square')}
                </span>
              )}
              <span className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-gray-400">
                {currentResult.model?.split('/').pop() || 'flux'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4" />{t('aiStudio.download')}
              </button>
              <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors">
                <Share2 className="w-4 h-4" />{t('aiStudio.share')}
              </button>
              <button onClick={handlePostToReels} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-500 hover:to-purple-500 transition-colors">
                <Play className="w-4 h-4" />{t('aiStudio.postToReels')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!currentResult && !isGenerating && !isGeneratingVideo && !currentError && (
        <Empty
          icon={activeTab === 'video' ? Video : ImageIcon}
          title={activeTab === 'video' ? t('aiStudio.videoReadyToCreate') : t('aiStudio.readyToCreate')}
          description={activeTab === 'video' ? t('aiStudio.videoReadyToCreateDesc') : t('aiStudio.readyToCreateDesc')}
        />
      )}
    </div>
  )
}
