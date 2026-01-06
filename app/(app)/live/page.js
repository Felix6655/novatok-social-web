'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Video, VideoOff, Mic, MicOff, RefreshCw, Radio, Camera, AlertCircle, Settings } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

export default function LivePage() {
  const { toast } = useToast()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  
  // State
  const [permissionState, setPermissionState] = useState('idle') // idle, requesting, granted, denied
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [videoDevices, setVideoDevices] = useState([])
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0)
  const [canSwitchCamera, setCanSwitchCamera] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Cleanup on unmount
    return () => {
      stopAllTracks()
    }
  }, [])

  // Stop all media tracks
  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Get available video devices
  const getVideoDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')
      setVideoDevices(cameras)
      setCanSwitchCamera(cameras.length > 1)
    } catch (e) {
      console.error('Failed to enumerate devices:', e)
    }
  }, [])

  // Request camera and mic permissions
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
      toast({ type: 'success', message: 'Camera and microphone enabled!' })
      
    } catch (error) {
      console.error('Permission error:', error)
      setPermissionState('denied')
      
      if (error.name === 'NotAllowedError') {
        toast({ type: 'error', message: 'Permission denied. Please allow camera and mic access.' })
      } else if (error.name === 'NotFoundError') {
        toast({ type: 'error', message: 'No camera or microphone found on this device.' })
      } else {
        toast({ type: 'error', message: 'Failed to access camera and microphone.' })
      }
    }
  }

  // Toggle video track
  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
        toast({ type: 'info', message: videoTrack.enabled ? 'Camera on' : 'Camera off' })
      }
    }
  }, [toast])

  // Toggle audio track
  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
        toast({ type: 'info', message: audioTrack.enabled ? 'Microphone on' : 'Microphone muted' })
      }
    }
  }, [toast])

  // Switch camera (front/back)
  const switchCamera = useCallback(async () => {
    if (!canSwitchCamera || videoDevices.length < 2) return
    
    const nextIndex = (currentDeviceIndex + 1) % videoDevices.length
    const nextDevice = videoDevices[nextIndex]
    
    try {
      // Stop current video track
      if (streamRef.current) {
        const currentVideoTrack = streamRef.current.getVideoTracks()[0]
        if (currentVideoTrack) {
          currentVideoTrack.stop()
        }
      }
      
      // Get new stream with selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: nextDevice.deviceId } },
        audio: true
      })
      
      // Replace video track
      if (streamRef.current) {
        const oldAudioTrack = streamRef.current.getAudioTracks()[0]
        
        // Create new stream with new video and existing audio settings
        const newVideoTrack = newStream.getVideoTracks()[0]
        const newAudioTrack = newStream.getAudioTracks()[0]
        
        // Maintain audio enabled state
        if (newAudioTrack) {
          newAudioTrack.enabled = isAudioEnabled
        }
        
        // Stop old audio from new stream if we want to keep original
        if (oldAudioTrack && newAudioTrack) {
          newAudioTrack.stop()
        }
        
        streamRef.current = new MediaStream([
          newVideoTrack,
          oldAudioTrack || newAudioTrack
        ])
      } else {
        streamRef.current = newStream
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current
      }
      
      setCurrentDeviceIndex(nextIndex)
      setIsVideoEnabled(true)
      toast({ type: 'success', message: 'Camera switched' })
      
    } catch (error) {
      console.error('Failed to switch camera:', error)
      toast({ type: 'error', message: 'Failed to switch camera' })
    }
  }, [canSwitchCamera, videoDevices, currentDeviceIndex, isAudioEnabled, toast])

  // Handle Start Live (placeholder)
  const handleStartLive = () => {
    toast({ type: 'info', message: 'Live streaming coming soon' })
  }

  // Retry permissions
  const retryPermissions = () => {
    setPermissionState('idle')
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-800/50 rounded-2xl" />
        <div className="aspect-video bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30">
            <Video className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Go Live</h1>
            <p className="text-sm text-gray-500">Share your moment</p>
          </div>
        </div>
        {permissionState === 'granted' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Ready</span>
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
            <h2 className="text-xl font-bold text-white mb-2">Enable Camera & Microphone</h2>
            <p className="text-gray-400 max-w-sm mx-auto mb-6">
              To go live, we need access to your camera and microphone. Your privacy matters — we only use them when you&apos;re broadcasting.
            </p>
            <button
              onClick={requestPermissions}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold hover:from-red-500 hover:to-orange-500 transition-all hover:scale-105 active:scale-[0.98]"
            >
              Enable Camera & Mic
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
            <h2 className="text-xl font-bold text-white mb-2">Requesting Access...</h2>
            <p className="text-gray-400">Please allow camera and microphone access in the browser prompt.</p>
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
            <h2 className="text-xl font-bold text-white mb-2">Permission Denied</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Camera or microphone access was denied. To go live, please allow access in your browser settings:
            </p>
            <div className="bg-gray-900/50 rounded-xl p-4 max-w-sm mx-auto mb-6 text-left">
              <ol className="text-sm text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">1.</span>
                  Click the camera/lock icon in your browser&apos;s address bar
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">2.</span>
                  Find Camera and Microphone permissions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">3.</span>
                  Change both to &quot;Allow&quot;
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">4.</span>
                  Refresh this page
                </li>
              </ol>
            </div>
            <button
              onClick={retryPermissions}
              className="px-6 py-3 rounded-xl border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Live Preview (Granted State) */}
      {permissionState === 'granted' && (
        <>
          {/* Video Preview */}
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
              />
              
              {/* Camera Off Overlay */}
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <VideoOff className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">Camera is off</p>
                  </div>
                </div>
              )}
              
              {/* Preview Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                <span className="text-xs text-white font-medium">Preview</span>
              </div>
              
              {/* Audio Indicator */}
              {!isAudioEnabled && (
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-red-500/80 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5">
                    <MicOff className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs text-white font-medium">Muted</span>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center justify-center gap-3">
                {/* Toggle Camera */}
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-xl transition-all ${
                    isVideoEnabled
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                  title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>

                {/* Toggle Mic */}
                <button
                  onClick={toggleAudio}
                  className={`p-4 rounded-xl transition-all ${
                    isAudioEnabled
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                  title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>

                {/* Switch Camera (only show if multiple cameras) */}
                {canSwitchCamera && (
                  <button
                    onClick={switchCamera}
                    className="p-4 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-all"
                    title="Switch camera"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
                )}
              </div>
              
              {/* Device info */}
              {videoDevices.length > 0 && (
                <p className="text-xs text-gray-600 text-center mt-3">
                  Camera: {videoDevices[currentDeviceIndex]?.label || `Camera ${currentDeviceIndex + 1}`}
                </p>
              )}
            </div>
          </div>

          {/* Start Live Button */}
          <button
            onClick={handleStartLive}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-lg flex items-center justify-center gap-3 hover:from-red-500 hover:to-orange-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20"
          >
            <Radio className="w-6 h-6" />
            Start Live
          </button>

          {/* Tips */}
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Tips for going live</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Find good lighting — face a window or light source
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Check your background is appropriate
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Use headphones to avoid echo
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Ensure stable internet connection
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
