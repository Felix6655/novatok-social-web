import { NextResponse } from 'next/server'
import Replicate from 'replicate'

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

// Image-to-video model (Stable Video Diffusion is reliable for this)
const I2V_MODEL = process.env.REPLICATE_I2V_MODEL || 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438'

/**
 * POST /api/ai/video/from-image - Generate video from image
 */
export async function POST(request) {
  try {
    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { 
          error: 'Replicate API not configured', 
          code: 'CONFIG_ERROR',
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      imageUrl, 
      prompt = '',
      motionBucketId = 127, // 1-255, higher = more motion
      fps = 7,
      seed = null,
    } = body

    // Validate image URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Image URL is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    console.log(`[AI Video I2V] Starting generation from image`)
    console.log(`[AI Video I2V] Image: ${imageUrl.substring(0, 50)}...`)

    // Build input for SVD
    const input = {
      input_image: imageUrl,
      motion_bucket_id: motionBucketId,
      fps: fps,
      cond_aug: 0.02,
      decoding_t: 14,
      video_length: 'short', // 14 frames
    }

    if (seed !== null) {
      input.seed = parseInt(seed, 10)
    }

    // Create prediction
    const prediction = await replicate.predictions.create({
      version: I2V_MODEL.split(':')[1],
      input,
    })

    console.log(`[AI Video I2V] Prediction created: ${prediction.id}`)

    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
      model: I2V_MODEL,
      type: 'image-to-video',
      createdAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[AI Video I2V] Generation error:', error)

    return NextResponse.json(
      { 
        error: 'Failed to start video generation from image', 
        code: 'GENERATION_ERROR',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
