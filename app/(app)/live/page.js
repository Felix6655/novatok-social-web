'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { 
  Video, VideoOff, Mic, MicOff, RefreshCw, Camera, AlertCircle, 
  Square, Play, Check, X, Upload, RotateCcw, Clock
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { postVideoToReels, storeBlobUrl } from '@/src/services/userVideos'

const MAX_RECORDING_SECONDS = 15

export default function GoLiveLitePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  
  // Refs
  const videoRef = useRef(null)
  const previewRef = useRef(null)
  const streamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  
  // State
  const [mounted, setMounted] = useState(false)
  const [permissionState, setPermissionState] = useState('idle') // idle, requesting, granted, denied
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [videoDevices, setVideoDevices] = useState([])
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0)
  const [canSwitchCamera, setCanSwitchCamera] = useState(false)
  
  // Recording state
  const [recordingState, setRecordingState] = useState('idle') // idle, recording, recorded
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedBlobUrl, setRecordedBlobUrl] = useState(null)
  const [caption, setCaption] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  // Cleanup function
  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    return () => {
      stopAllTracks()
      cleanupTimer()
    }
  }, [stopAllTracks, cleanupTimer])

  // Get video devices
  const getVideoDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(d => d.kind === 'videoinput')
      setVideoDevices(cameras)
      setCanSwitchCamera(cameras.length > 1)
    } catch (e) {
      console.error('Failed to enumerate devices:', e)
    }
  }, [])

  // Request permissions
  const requestPermissions = async () => {
    setPermissionState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setPermissionState('granted')
      await getVideoDevices()
      toast({ type: 'success', message: t('goLive.permissionsGranted') })
    } catch (error) {
      console.error('Permission error:', error)
      setPermissionState('denied')
      if (error.name === 'NotAllowedError') {
        toast({ type: 'error', message: t('goLive.permissionDenied') })
      } else if (error.name === 'NotFoundError') {
        toast({ type: 'error', message: t('goLive.noDeviceFound') })
      } else {
        toast({ type: 'error', message: t('goLive.permissionError') })
      }
    }
  }

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0]
      if (track) {
        track.enabled = !track.enabled
        setIsVideoEnabled(track.enabled)
      }
    }
  }, [])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0]
      if (track) {
        track.enabled = !track.enabled
        setIsAudioEnabled(track.enabled)
      }
    }
  }, [])

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (!canSwitchCamera || videoDevices.length < 2) return
    const nextIndex = (currentDeviceIndex + 1) % videoDevices.length
    const nextDevice = videoDevices[nextIndex]
    try {
      if (streamRef.current) {
        streamRef.current.getVideoTracks()[0]?.stop()
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: nextDevice.deviceId } },
        audio: true
      })
      const oldAudio = streamRef.current?.getAudioTracks()[0]
      const newVideo = newStream.getVideoTracks()[0]
      const newAudio = newStream.getAudioTracks()[0]
      if (newAudio) newAudio.enabled = isAudioEnabled
      if (oldAudio && newAudio) newAudio.stop()
      streamRef.current = new MediaStream([newVideo, oldAudio || newAudio])
      if (videoRef.current) videoRef.current.srcObject = streamRef.current
      setCurrentDeviceIndex(nextIndex)
      setIsVideoEnabled(true)
      toast({ type: 'success', message: t('goLive.cameraSwitched') })
    } catch (error) {
      console.error('Switch camera error:', error)
      toast({ type: 'error', message: t('goLive.switchCameraFailed') })
    }
  }, [canSwitchCamera, videoDevices, currentDeviceIndex, isAudioEnabled, toast, t])

  // Start recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) return
    
    chunksRef.current = []
    setRecordingTime(0)
    setRecordedBlobUrl(null)
    
    try {
      const options = { mimeType: 'video/webm;codecs=vp9,opus' }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm'
      }
      
      const recorder = new MediaRecorder(streamRef.current, options)
      mediaRecorderRef.current = recorder
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = storeBlobUrl(blob)
        setRecordedBlobUrl(url)
        setRecordingState('recorded')
        cleanupTimer()
      }
      
      recorder.start(100) // Collect data every 100ms
      setRecordingState('recording')
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const next = prev + 1
          if (next >= MAX_RECORDING_SECONDS) {
            stopRecording()
          }
          return next
        })
      }, 1000)
      
      toast({ type: 'info', message: t('goLive.recordingStarted') })
    } catch (error) {
      console.error('Start recording error:', error)
      toast({ type: 'error', message: t('goLive.recordingFailed') })
    }
  }, [cleanupTimer, toast, t])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    cleanupTimer()
  }, [cleanupTimer])

  // Record again
  const recordAgain = useCallback(() => {
    if (recordedBlobUrl) {
      URL.revokeObjectURL(recordedBlobUrl)
    }
    setRecordedBlobUrl(null)
    setRecordingState('idle')
    setRecordingTime(0)
    setCaption('')
  }, [recordedBlobUrl])

  // Post to Reels
  const handlePostToReels = useCallback(async () => {
    if (!recordedBlobUrl) return
    
    setIsPosting(true)
    try {
      await postVideoToReels({
        blobUrl: recordedBlobUrl,
        caption: caption.trim(),
        duration: recordingTime,
      })
      toast({ type: 'success', message: t('goLive.postingToReels') })
      router.push('/reels?upload=video')
    } catch (error) {
      console.error('Post to Reels error:', error)
      toast({ type: 'error', message: t('goLive.postFailed') })
      setIsPosting(false)
    }
  }, [recordedBlobUrl, caption, recordingTime, router, toast, t])

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-gray-800/50 rounded-xl w-48" />
        <div className="aspect-video bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            recordingState === 'recording'
              ? 'bg-red-500/20 border-red-500/30'
              : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30'
          }`}>
            <Video className={`w-5 h-5 ${
              recordingState === 'recording' ? 'text-red-400 animate-pulse' : 'text-red-400'
            }`} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">{t('goLive.title')}</h1>
            <p className="text-sm text-gray-500">
              {recordingState === 'recording' 
                ? t('goLive.recording')
                : recordingState === 'recorded'
                ? t('goLive.recordingComplete')
                : t('goLive.subtitle')}
            </p>
          </div>
        </div>
        
        {/* Recording indicator */}
        {recordingState === 'recording' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-mono text-red-400">
              {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_SECONDS)}
            </span>
          </div>
        )}
      </div>

      {/* Permission Request State */}
      {permissionState === 'idle' && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8">
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <Camera className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('goLive.enableCameraMic')}</h2>
            <p className="text-gray-400 max-w-sm mx-auto mb-6">
              {t('goLive.enableCameraMicDesc')}
            </p>
            <button
              onClick={requestPermissions}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold hover:from-red-500 hover:to-orange-500 transition-all"
            >
              {t('goLive.enableCameraMicBtn')}
            </button>
          </div>
        </div>
      )}

      {/* Requesting State */}
      {permissionState === 'requesting' && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8">
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/30 animate-pulse">
              <Camera className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('goLive.requestingAccess')}</h2>
            <p className="text-gray-400">{t('goLive.requestingAccessDesc')}</p>
          </div>
        </div>
      )}

      {/* Permission Denied State */}
      {permissionState === 'denied' && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8">
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('goLive.permissionDeniedTitle')}</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              {t('goLive.permissionDeniedDesc')}
            </p>
            <div className="bg-gray-900/50 rounded-xl p-4 max-w-sm mx-auto mb-6 text-left">
              <ol className="text-sm text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">1.</span>
                  {t('goLive.permissionStep1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">2.</span>
                  {t('goLive.permissionStep2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">3.</span>
                  {t('goLive.permissionStep3')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">4.</span>
                  {t('goLive.permissionStep4')}
                </li>
              </ol>
            </div>
            <button
              onClick={() => setPermissionState('idle')}
              className="px-6 py-3 rounded-xl border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 transition-colors"
            >
              {t('goLive.tryAgain')}
            </button>
          </div>
        </div>
      )}

      {/* Camera Preview / Recording / Playback */}
      {permissionState === 'granted' && (
        <>
          {/* Video Container */}
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
            <div className="relative aspect-video bg-black">
              {/* Live Preview (when not recorded) */}
              {recordingState !== 'recorded' && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                />
              )}
              
              {/* Playback Preview (after recording) */}
              {recordingState === 'recorded' && recordedBlobUrl && (
                <video
                  ref={previewRef}
                  src={recordedBlobUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              )}
              
              {/* Camera Off Overlay */}
              {!isVideoEnabled && recordingState !== 'recorded' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <VideoOff className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">{t('goLive.cameraOff')}</p>
                  </div>
                </div>
              )}
              
              {/* Recording Timer Overlay */}
              {recordingState === 'recording' && (
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-red-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-xs text-white font-bold">REC</span>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                    <span className="text-sm text-white font-mono">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Progress Bar */}
              {recordingState === 'recording' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                  <div 
                    className="h-full bg-red-500 transition-all duration-1000"
                    style={{ width: `${(recordingTime / MAX_RECORDING_SECONDS) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-gray-800">
              {recordingState === 'idle' && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-xl transition-all ${
                      isVideoEnabled
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                    title={isVideoEnabled ? t('goLive.turnOffCamera') : t('goLive.turnOnCamera')}
                  >
                    {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                  </button>
                  
                  <button
                    onClick={toggleAudio}
                    className={`p-4 rounded-xl transition-all ${
                      isAudioEnabled
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                    title={isAudioEnabled ? t('goLive.muteMic') : t('goLive.unmuteMic')}
                  >
                    {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </button>
                  
                  {canSwitchCamera && (
                    <button
                      onClick={switchCamera}
                      className="p-4 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-all"
                      title={t('goLive.switchCamera')}
                    >
                      <RefreshCw className="w-6 h-6" />
                    </button>
                  )}
                </div>
              )}
              
              {recordingState === 'recording' && (
                <div className="flex items-center justify-center">
                  <button
                    onClick={stopRecording}
                    className="p-4 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all flex items-center gap-2"
                  >
                    <Square className="w-6 h-6 fill-current" />
                    <span className="font-medium">{t('goLive.stopRecording')}</span>
                  </button>
                </div>
              )}
              
              {recordingState === 'recorded' && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={recordAgain}
                    className="px-4 py-3 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>{t('goLive.recordAgain')}</span>
                  </button>
                </div>
              )}
              
              {videoDevices.length > 0 && recordingState === 'idle' && (
                <p className="text-xs text-gray-600 text-center mt-3">
                  {t('goLive.camera')}: {videoDevices[currentDeviceIndex]?.label || `Camera ${currentDeviceIndex + 1}`}
                </p>
              )}
            </div>
          </div>

          {/* Start Recording Button */}
          {recordingState === 'idle' && (
            <button
              onClick={startRecording}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-lg flex items-center justify-center gap-3 hover:from-red-500 hover:to-orange-500 transition-all"
            >
              <div className="w-4 h-4 rounded-full bg-white" />
              {t('goLive.startRecording')}
            </button>
          )}

          {/* Caption & Post Section */}
          {recordingState === 'recorded' && (
            <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  {t('goLive.captionLabel')}
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t('goLive.captionPlaceholder')}
                  maxLength={200}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50"
                />
                <p className="text-xs text-gray-600 text-right mt-1">{caption.length}/200</p>
              </div>
              
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/50">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">
                  {t('goLive.duration')}: {formatTime(recordingTime)}
                </span>
              </div>
              
              <button
                onClick={handlePostToReels}
                disabled={isPosting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold flex items-center justify-center gap-3 hover:from-pink-500 hover:to-purple-500 transition-all disabled:opacity-50"
              >
                {isPosting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('goLive.posting')}
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {t('goLive.postToReels')}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tips */}
          {recordingState === 'idle' && (
            <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-3">{t('goLive.tips')}</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  {t('goLive.tip1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  {t('goLive.tip2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  {t('goLive.tip3')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">⏱</span>
                  {t('goLive.maxDuration', { seconds: MAX_RECORDING_SECONDS })}
                </li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
