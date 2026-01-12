import { NextResponse } from 'next/server'
import Replicate from 'replicate'

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

// Configurable video model (default to a reliable text-to-video model)
// Options: 'minimax/video-01', 'lucataco/animate-diff', 'anotherjesse/zeroscope-v2-xl', etc.
const DEFAULT_VIDEO_MODEL = process.env.REPLICATE_VIDEO_MODEL || 'minimax/video-01'

// Aspect ratio configurations
const ASPECT_RATIOS = {
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
  '1:1': { width: 720, height: 720 },
  '4:3': { width: 960, height: 720 },
  '3:4': { width: 720, height: 960 },
}

// Store for tracking predictions (in production, use Redis or DB)
const predictionStore = new Map()

/**
 * POST /api/ai/video - Start video generation
 */
export async function POST(request) {
  try {
    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { 
          error: 'Replicate API not configured', 
          code: 'CONFIG_ERROR',
          message: 'REPLICATE_API_TOKEN environment variable is not set'
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      prompt, 
      negativePrompt = '',
      aspectRatio = '16:9',
      durationSeconds = 5,
      fps = 24,
      seed = null,
    } = body

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: 'Prompt too long (max 1000 characters)', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Validate aspect ratio
    const aspectConfig = ASPECT_RATIOS[aspectRatio]
    if (!aspectConfig) {
      return NextResponse.json(
        { error: 'Invalid aspect ratio', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Build input parameters based on model type
    const modelName = DEFAULT_VIDEO_MODEL
    let input = {}

    // Different models have different input schemas
    if (modelName.includes('minimax') || modelName.includes('video-01')) {
      // Minimax video-01 schema
      input = {
        prompt: prompt.trim(),
        prompt_optimizer: true,
      }
    } else if (modelName.includes('animate-diff') || modelName.includes('zeroscope')) {
      // AnimateDiff / Zeroscope style models
      input = {
        prompt: prompt.trim(),
        negative_prompt: negativePrompt || 'blurry, low quality, distorted',
        num_frames: Math.min(durationSeconds * fps, 100), // Cap frames
        fps: fps,
        width: aspectConfig.width,
        height: aspectConfig.height,
      }
      if (seed !== null) input.seed = parseInt(seed, 10)
    } else {
      // Generic fallback
      input = {
        prompt: prompt.trim(),
        num_frames: durationSeconds * fps,
        fps: fps,
      }
    }

    console.log(`[AI Video] Starting generation with model: ${modelName}`)
    console.log(`[AI Video] Prompt: ${prompt.substring(0, 100)}...`)

    // Create prediction (async - returns immediately with ID)
    const prediction = await replicate.predictions.create({
      model: modelName,
      input,
    })

    console.log(`[AI Video] Prediction created: ${prediction.id}`)

    // Store prediction info
    predictionStore.set(prediction.id, {
      prompt: prompt.trim(),
      aspectRatio,
      durationSeconds,
      model: modelName,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
      model: modelName,
      createdAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[AI Video] Generation error:', error)

    if (error.message?.includes('Invalid token')) {
      return NextResponse.json(
        { error: 'Invalid API token', code: 'AUTH_ERROR' },
        { status: 401 }
      )
    }

    if (error.message?.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.', code: 'RATE_LIMIT' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to start video generation', 
        code: 'GENERATION_ERROR',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/video?id=... - Get prediction status
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // If no ID, return API status
    if (!id) {
      const isConfigured = !!process.env.REPLICATE_API_TOKEN
      return NextResponse.json({
        status: isConfigured ? 'ready' : 'not_configured',
        model: DEFAULT_VIDEO_MODEL,
        supportedAspectRatios: Object.keys(ASPECT_RATIOS),
      })
    }

    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'API not configured', code: 'CONFIG_ERROR' },
        { status: 500 }
      )
    }

    // Get prediction status
    const prediction = await replicate.predictions.get(id)

    // Get stored metadata
    const metadata = predictionStore.get(id) || {}

    // Map Replicate status to our standard format
    let status = prediction.status
    let progress = null

    switch (prediction.status) {
      case 'starting':
        status = 'starting'
        progress = 0
        break
      case 'processing':
        status = 'processing'
        // Estimate progress based on logs if available
        progress = prediction.logs ? Math.min(90, 10 + (prediction.logs.length / 10)) : 50
        break
      case 'succeeded':
        status = 'completed'
        progress = 100
        break
      case 'failed':
        status = 'failed'
        break
      case 'canceled':
        status = 'canceled'
        break
    }

    const response = {
      id: prediction.id,
      status,
      progress,
      prompt: metadata.prompt,
      model: metadata.model || DEFAULT_VIDEO_MODEL,
      createdAt: metadata.createdAt || prediction.created_at,
    }

    // Add output if completed
    if (prediction.status === 'succeeded' && prediction.output) {
      // Output can be a string URL or array of URLs
      response.videoUrl = Array.isArray(prediction.output) 
        ? prediction.output[0] 
        : prediction.output
      response.outputs = prediction.output
    }

    // Add error if failed
    if (prediction.status === 'failed') {
      response.error = prediction.error || 'Video generation failed'
    }

    // Add metrics if available
    if (prediction.metrics) {
      response.metrics = {
        predictTime: prediction.metrics.predict_time,
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[AI Video] Status check error:', error)

    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Prediction not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to get video status', 
        code: 'STATUS_ERROR',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
