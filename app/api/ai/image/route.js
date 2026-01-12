import { NextResponse } from 'next/server'
import Replicate from 'replicate'

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

// Configurable model (default to flux-schnell for fast generation)
const DEFAULT_MODEL = process.env.REPLICATE_IMAGE_MODEL || 'black-forest-labs/flux-schnell'

// Style presets with model-appropriate parameters
const STYLE_PRESETS = {
  none: {},
  photorealistic: {
    suffix: ', photorealistic, hyperrealistic, 8k, ultra detailed, DSLR photography',
  },
  anime: {
    suffix: ', anime style, studio ghibli, vibrant colors, detailed',
  },
  digital_art: {
    suffix: ', digital art, concept art, artstation trending, highly detailed',
  },
  oil_painting: {
    suffix: ', oil painting, classical art style, museum quality, brushstrokes visible',
  },
  watercolor: {
    suffix: ', watercolor painting, soft colors, artistic, flowing',
  },
  '3d_render': {
    suffix: ', 3D render, octane render, cinema 4D, unreal engine, highly detailed',
  },
  cinematic: {
    suffix: ', cinematic, movie still, dramatic lighting, anamorphic, film grain',
  },
  neon: {
    suffix: ', neon lights, cyberpunk, synthwave, glowing, vibrant colors',
  },
}

// Size configurations
const SIZE_CONFIGS = {
  square: { width: 1024, height: 1024, aspect_ratio: '1:1' },
  portrait: { width: 768, height: 1024, aspect_ratio: '3:4' },
  landscape: { width: 1024, height: 768, aspect_ratio: '4:3' },
  wide: { width: 1280, height: 720, aspect_ratio: '16:9' },
}

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
      style = 'none', 
      size = 'square',
      negativePrompt = '',
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

    // Build enhanced prompt with style
    const styleConfig = STYLE_PRESETS[style] || STYLE_PRESETS.none
    const enhancedPrompt = prompt.trim() + (styleConfig.suffix || '')

    // Get size config
    const sizeConfig = SIZE_CONFIGS[size] || SIZE_CONFIGS.square

    // Build input parameters for the model
    const input = {
      prompt: enhancedPrompt,
      aspect_ratio: sizeConfig.aspect_ratio,
      output_format: 'webp',
      output_quality: 90,
    }

    // Add negative prompt if provided
    if (negativePrompt && negativePrompt.trim()) {
      input.negative_prompt = negativePrompt.trim()
    }

    // Add seed for reproducibility if provided
    if (seed !== null && seed !== undefined) {
      input.seed = parseInt(seed, 10)
    }

    console.log(`[AI Image] Generating with model: ${DEFAULT_MODEL}`)
    console.log(`[AI Image] Prompt: ${enhancedPrompt.substring(0, 100)}...`)

    // Run the model
    const output = await replicate.run(DEFAULT_MODEL, { input })

    // Handle response - Replicate typically returns an array of URLs or a single URL
    let imageUrl = null
    if (Array.isArray(output)) {
      imageUrl = output[0]
    } else if (typeof output === 'string') {
      imageUrl = output
    } else if (output && output.url) {
      imageUrl = output.url
    }

    if (!imageUrl) {
      console.error('[AI Image] Unexpected output format:', output)
      return NextResponse.json(
        { error: 'Failed to generate image - unexpected response', code: 'GENERATION_ERROR' },
        { status: 500 }
      )
    }

    console.log(`[AI Image] Generated successfully: ${imageUrl.substring(0, 50)}...`)

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: prompt.trim(),
      enhancedPrompt,
      style,
      size,
      model: DEFAULT_MODEL,
      generatedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[AI Image] Generation error:', error)

    // Handle specific Replicate errors
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
        error: 'Failed to generate image', 
        code: 'GENERATION_ERROR',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check API status
export async function GET() {
  const isConfigured = !!process.env.REPLICATE_API_TOKEN
  
  return NextResponse.json({
    status: isConfigured ? 'ready' : 'not_configured',
    model: DEFAULT_MODEL,
    supportedStyles: Object.keys(STYLE_PRESETS),
    supportedSizes: Object.keys(SIZE_CONFIGS),
  })
}
