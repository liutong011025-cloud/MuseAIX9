import { NextRequest, NextResponse } from 'next/server'
import { logApiCall } from '@/lib/log-api-call'

// Letter Setup 专用配置
// 使用环境变量中的 DIFY_API_KEY（这是真正的 API Key）
const DIFY_API_KEY = process.env.DIFY_API_KEY || ''
const DIFY_LETTER_SETUP_APP_ID = 'app-3iAjb8MCQEXkUxcjvky6lhXt'
const DIFY_BASE_URL = 'https://api.dify.ai/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipient, occasion, user_id } = body

    if (!DIFY_API_KEY) {
      console.error('DIFY_API_KEY not configured')
      return NextResponse.json(
        { error: 'DIFY_API_KEY not configured' },
        { status: 500 }
      )
    }

    // 构建提示词
    const queryMessage = `A student wants to write a letter:
- To: "${recipient}"
- Reason: "${occasion}"

Please provide a brief, kid-friendly guidance (2-3 sentences max) on how to write this letter. Use simple words and be encouraging! Include emojis to make it fun! ✨`

    const url = `${DIFY_BASE_URL}/chat-messages`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIFY_API_KEY}`,
    }

    const requestBody: any = {
      inputs: {},
      query: queryMessage,
      response_mode: 'blocking',
      conversation_id: '',
      user: user_id || 'student',
      app_id: DIFY_LETTER_SETUP_APP_ID, // 指定使用正确的机器人
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Dify API error:', response.status, errorText)
      throw new Error(`Dify API error: ${response.status}`)
    }

    const data = await response.json()
    const guidance = data.answer || data.message || data.text || "Write from your heart! Be kind and honest. ✨"

    // 记录 API 调用
    try {
      await logApiCall(
        user_id,
        'letterSetup',
        '/api/dify-letter-setup',
        { recipient, occasion },
        { guidance }
      )
    } catch (logError) {
      console.error('Error logging API call:', logError)
    }

    return NextResponse.json({ guidance })
  } catch (error) {
    console.error('Error in letter setup API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

