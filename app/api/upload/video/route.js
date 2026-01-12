/**
 * Video Upload API Route
 * 
 * Uploads video files to Supabase Storage.
 * Returns a persistent public URL.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'reels'

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Allowed video types
const ALLOWED_TYPES = [
  'video/webm',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
]

/**
 * GET /api/upload/video - Check if upload is configured
 */
export async function GET() {
  const isConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY)
  
  return NextResponse.json({
    ok: true,
    configured: isConfigured,
    bucket: STORAGE_BUCKET,
    maxSize: MAX_FILE_SIZE,
  })
}

/**
 * POST /api/upload/video - Upload video file
 */
export async function POST(request) {
  try {
    // Check configuration
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'NOT_CONFIGURED',
            message: 'Storage service not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
          },
        },
        { status: 503 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('video')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'NO_FILE',
            message: 'No video file provided.',
          },
        },
        { status: 400 }
      )
    }

    // Validate file type
    const mimeType = file.type || 'video/webm'
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INVALID_TYPE',
            message: `Invalid file type: ${mimeType}. Allowed: ${ALLOWED_TYPES.join(', ')}`,
          },
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File too large. Max size: ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`,
          },
        },
        { status: 400 }
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 10)
    const extension = mimeType === 'video/webm' ? 'webm' : mimeType === 'video/mp4' ? 'mp4' : 'webm'
    const filename = `user_videos/${timestamp}_${randomId}.${extension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Upload] Supabase error:', uploadError)
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: uploadError.message || 'Failed to upload video.',
          },
        },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filename)

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'URL_FAILED',
            message: 'Failed to get public URL.',
          },
        },
        { status: 500 }
      )
    }

    console.log('[Upload] Success:', filename, file.size, 'bytes')

    return NextResponse.json({
      ok: true,
      url: urlData.publicUrl,
      path: filename,
      mimeType,
      size: file.size,
    })

  } catch (error) {
    console.error('[Upload] Server error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error.',
        },
      },
      { status: 500 }
    )
  }
}
