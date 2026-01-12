/**
 * AI Chat API Route
 * 
 * Proxies chat requests to AI providers.
 * Uses Emergent/OpenAI-compatible API.
 */

import { NextResponse } from 'next/server'

const AI_API_KEY = process.env.EMERGENT_API_KEY || process.env.OPENAI_API_KEY
const AI_BASE_URL = process.env.EMERGENT_BASE_URL || 'https://api.openai.com/v1'

// System prompts for different AI personalities
const AI_PERSONALITIES = {
  assistant: {
    name: 'Nova',
    systemPrompt: 'You are Nova, a helpful and friendly AI assistant. You are knowledgeable, concise, and always try to be helpful. Keep responses conversational and under 200 words unless more detail is specifically requested.',
  },
  creative: {
    name: 'Muse',
    systemPrompt: 'You are Muse, a creative AI focused on art, writing, and imagination. You are inspiring, artistic, and think outside the box. Help users with creative projects, brainstorming, and artistic expression. Be enthusiastic and encouraging.',
  },
  coach: {
    name: 'Sage',
    systemPrompt: 'You are Sage, a life coach AI. You provide thoughtful advice on personal growth, motivation, and wellness. Be empathetic, supportive, and help users achieve their goals. Ask clarifying questions when helpful.',
  },
  expert: {
    name: 'Atlas',
    systemPrompt: 'You are Atlas, a knowledgeable expert AI. You excel at explaining complex topics simply and providing accurate information. Be clear, educational, and thorough. Cite sources or note uncertainty when relevant.',
  },
}

// GET - Check service status
export async function GET() {
  const isConfigured = Boolean(AI_API_KEY)
  
  return NextResponse.json({
    configured: isConfigured,
    personalities: Object.keys(AI_PERSONALITIES).map(key => ({
      id: key,
      name: AI_PERSONALITIES[key].name,
    })),
  })
}

// POST - Send chat message
export async function POST(request) {
  try {
    if (!AI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured', code: 'NOT_CONFIGURED' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { messages, personality = 'assistant' } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const aiPersonality = AI_PERSONALITIES[personality] || AI_PERSONALITIES.assistant

    // Build messages with system prompt
    const chatMessages = [
      { role: 'system', content: aiPersonality.systemPrompt },
      ...messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ]

    // Call AI API
    const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[AI Chat] API error:', response.status, errorData)
      return NextResponse.json(
        { error: errorData.error?.message || 'AI service error', code: 'API_ERROR' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response from AI', code: 'EMPTY_RESPONSE' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: assistantMessage,
      personality: {
        id: personality,
        name: aiPersonality.name,
      },
      usage: data.usage,
    })

  } catch (error) {
    console.error('[AI Chat] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
