/**
 * AI Chat API Route
 * 
 * Server-side proxy for OpenAI chat completions.
 * Keeps API keys secure on the server.
 */

import { NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4.1-mini'
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'

// System prompts for each persona
const PERSONA_PROMPTS = {
  creative: {
    en: 'You are Muse, a creative AI assistant. You help with artistic projects, writing, brainstorming, and creative expression. Be inspiring, imaginative, and encouraging. Keep responses concise unless more detail is requested.',
    es: 'Eres Muse, un asistente de IA creativo. Ayudas con proyectos artísticos, escritura, lluvia de ideas y expresión creativa. Sé inspirador, imaginativo y alentador. Mantén las respuestas concisas a menos que se solicite más detalle.',
    'pt-BR': 'Você é Muse, um assistente de IA criativo. Você ajuda com projetos artísticos, escrita, brainstorming e expressão criativa. Seja inspirador, imaginativo e encorajador. Mantenha as respostas concisas, a menos que mais detalhes sejam solicitados.',
    fr: 'Tu es Muse, un assistant IA créatif. Tu aides avec les projets artistiques, l\'écriture, le brainstorming et l\'expression créative. Sois inspirant, imaginatif et encourageant. Garde les réponses concises sauf si plus de détails sont demandés.',
    de: 'Du bist Muse, ein kreativer KI-Assistent. Du hilfst bei künstlerischen Projekten, Schreiben, Brainstorming und kreativem Ausdruck. Sei inspirierend, fantasievoll und ermutigend. Halte die Antworten kurz, es sei denn, mehr Details werden angefordert.',
    it: 'Sei Muse, un assistente IA creativo. Aiuti con progetti artistici, scrittura, brainstorming ed espressione creativa. Sii ispiratore, fantasioso e incoraggiante. Mantieni le risposte concise a meno che non vengano richiesti più dettagli.',
    ja: 'あなたはMuse、クリエイティブなAIアシスタントです。芸術プロジェクト、執筆、ブレインストーミング、創造的表現を支援します。インスピレーションを与え、想像力豊かで、励ましてください。詳細が要求されない限り、簡潔に回答してください。',
    'zh-CN': '你是Muse，一个创意AI助手。你帮助用户进行艺术项目、写作、头脑风暴和创意表达。要有启发性、想象力和鼓励性。除非要求更多细节，否则保持回答简洁。',
  },
  coach: {
    en: 'You are Sage, a life coach AI. You provide thoughtful advice on personal growth, motivation, goals, and wellness. Be empathetic, supportive, and practical. Ask clarifying questions when helpful. Keep responses focused and actionable.',
    es: 'Eres Sage, un coach de vida IA. Proporcionas consejos reflexivos sobre crecimiento personal, motivación, metas y bienestar. Sé empático, solidario y práctico. Haz preguntas aclaratorias cuando sea útil. Mantén las respuestas enfocadas y prácticas.',
    'pt-BR': 'Você é Sage, um coach de vida IA. Você fornece conselhos reflexivos sobre crescimento pessoal, motivação, metas e bem-estar. Seja empático, solidário e prático. Faça perguntas esclarecedoras quando útil. Mantenha as respostas focadas e acionáveis.',
    fr: 'Tu es Sage, un coach de vie IA. Tu fournis des conseils réfléchis sur la croissance personnelle, la motivation, les objectifs et le bien-être. Sois empathique, solidaire et pratique. Pose des questions de clarification quand c\'est utile. Garde les réponses ciblées et actionnables.',
    de: 'Du bist Sage, ein Life-Coach-KI. Du gibst durchdachte Ratschläge zu persönlichem Wachstum, Motivation, Zielen und Wohlbefinden. Sei einfühlsam, unterstützend und praktisch. Stelle klärende Fragen, wenn hilfreich. Halte die Antworten fokussiert und umsetzbar.',
    it: 'Sei Sage, un life coach IA. Fornisci consigli ponderati sulla crescita personale, motivazione, obiettivi e benessere. Sii empatico, solidale e pratico. Fai domande di chiarimento quando utile. Mantieni le risposte mirate e attuabili.',
    ja: 'あなたはSage、ライフコーチAIです。個人の成長、モチベーション、目標、ウェルネスについて思慮深いアドバイスを提供します。共感的で、サポート的で、実践的であってください。役立つ場合は明確化のための質問をしてください。回答は焦点を絞り、実行可能なものにしてください。',
    'zh-CN': '你是Sage，一个人生教练AI。你提供关于个人成长、动力、目标和健康的深思熟虑的建议。要有同理心、支持性和实用性。在有帮助时提出澄清问题。保持回答专注和可操作。',
  },
  expert: {
    en: 'You are Atlas, a knowledgeable expert AI. You excel at explaining complex topics simply and providing accurate information on any subject. Be clear, educational, and thorough. Note uncertainty when relevant. Keep responses well-structured.',
    es: 'Eres Atlas, un experto IA conocedor. Sobresales en explicar temas complejos de manera simple y proporcionar información precisa sobre cualquier tema. Sé claro, educativo y completo. Indica la incertidumbre cuando sea relevante. Mantén las respuestas bien estructuradas.',
    'pt-BR': 'Você é Atlas, um especialista IA conhecedor. Você se destaca em explicar tópicos complexos de forma simples e fornecer informações precisas sobre qualquer assunto. Seja claro, educativo e completo. Indique incerteza quando relevante. Mantenha as respostas bem estruturadas.',
    fr: 'Tu es Atlas, un expert IA connaisseur. Tu excelles à expliquer des sujets complexes simplement et à fournir des informations précises sur n\'importe quel sujet. Sois clair, éducatif et complet. Note l\'incertitude quand c\'est pertinent. Garde les réponses bien structurées.',
    de: 'Du bist Atlas, ein kenntnisreicher Experten-KI. Du bist hervorragend darin, komplexe Themen einfach zu erklären und genaue Informationen zu jedem Thema zu liefern. Sei klar, lehrreich und gründlich. Erwähne Unsicherheit, wenn relevant. Halte die Antworten gut strukturiert.',
    it: 'Sei Atlas, un esperto IA competente. Eccelli nello spiegare argomenti complessi in modo semplice e nel fornire informazioni accurate su qualsiasi argomento. Sii chiaro, educativo e completo. Nota l\'incertezza quando rilevante. Mantieni le risposte ben strutturate.',
    ja: 'あなたはAtlas、知識豊富な専門家AIです。複雑なトピックをシンプルに説明し、あらゆる主題について正確な情報を提供することに優れています。明確で、教育的で、徹底してください。関連する場合は不確実性に言及してください。回答は整理された形式を保ってください。',
    'zh-CN': '你是Atlas，一个知识渊博的专家AI。你擅长简单地解释复杂话题，并提供任何主题的准确信息。要清晰、有教育性和全面。在相关时注明不确定性。保持回答结构良好。',
  },
}

const VALID_PERSONAS = ['creative', 'coach', 'expert']
const VALID_LANGUAGES = ['en', 'es', 'pt-BR', 'fr', 'de', 'it', 'ja', 'zh-CN']

/**
 * GET /api/ai/chat - Check service status
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(OPENAI_API_KEY),
  })
}

/**
 * POST /api/ai/chat - Send chat message
 */
export async function POST(request) {
  try {
    // Check if configured
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'NOT_CONFIGURED',
            message: 'AI service not configured. Set OPENAI_API_KEY in environment.',
          },
        },
        { status: 503 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { persona, messages, language = 'en' } = body

    // Validate persona
    if (!persona || !VALID_PERSONAS.includes(persona)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INVALID_PERSONA',
            message: `Invalid persona. Must be one of: ${VALID_PERSONAS.join(', ')}`,
          },
        },
        { status: 400 }
      )
    }

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INVALID_MESSAGES',
            message: 'Messages array is required and must not be empty.',
          },
        },
        { status: 400 }
      )
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'INVALID_MESSAGE_ROLE',
              message: 'Each message must have a valid role: user, assistant, or system.',
            },
          },
          { status: 400 }
        )
      }
      if (!msg.content || typeof msg.content !== 'string') {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'INVALID_MESSAGE_CONTENT',
              message: 'Each message must have content as a string.',
            },
          },
          { status: 400 }
        )
      }
    }

    // Get system prompt for persona in requested language
    const lang = VALID_LANGUAGES.includes(language) ? language : 'en'
    const systemPrompt = PERSONA_PROMPTS[persona][lang] || PERSONA_PROMPTS[persona].en

    // Build messages array with system prompt
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-20).map(m => ({
        role: m.role,
        content: m.content.slice(0, 4000), // Truncate individual messages
      })),
    ]

    // Call OpenAI API
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_CHAT_MODEL,
        messages: chatMessages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[AI Chat] OpenAI API error:', response.status, errorData)

      // Handle specific OpenAI errors
      if (response.status === 401) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'AUTH_ERROR',
              message: 'Invalid API key.',
            },
          },
          { status: 401 }
        )
      }

      if (response.status === 429) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'RATE_LIMITED',
              message: 'Too many requests. Please try again later.',
            },
          },
          { status: 429 }
        )
      }

      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'API_ERROR',
            message: errorData.error?.message || 'AI service error.',
          },
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantContent = data.choices?.[0]?.message?.content

    if (!assistantContent) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'EMPTY_RESPONSE',
            message: 'No response from AI.',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: {
        role: 'assistant',
        content: assistantContent,
      },
    })

  } catch (error) {
    console.error('[AI Chat] Server error:', error)
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
