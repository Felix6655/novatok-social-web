// LiveKit Token Generation API Route
// Generates access tokens for room connections
// NEVER expose LIVEKIT_API_SECRET to the client

import { AccessToken } from 'livekit-server-sdk'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { room, identity, name } = await request.json()

    // Validate required fields
    if (!room || !identity) {
      return NextResponse.json(
        { error: 'Missing required fields: room and identity' },
        { status: 400 }
      )
    }

    // Check if LiveKit is configured
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const livekitUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json(
        { error: 'LiveKit is not configured' },
        { status: 503 }
      )
    }

    // Create access token
    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: name || identity,
      ttl: '1h', // Token valid for 1 hour
    })

    // Grant room permissions
    at.addGrant({
      roomJoin: true,
      room: room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true, // For chat messages
    })

    // Generate JWT token
    const token = await at.toJwt()

    return NextResponse.json({
      token,
      url: livekitUrl,
    })
  } catch (error) {
    console.error('LiveKit token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}

// Check if LiveKit is configured (for client to know)
export async function GET() {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const livekitUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL

  return NextResponse.json({
    configured: !!(apiKey && apiSecret && livekitUrl),
    url: livekitUrl || null,
  })
}
