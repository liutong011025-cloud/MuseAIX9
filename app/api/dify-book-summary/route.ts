import { NextRequest, NextResponse } from 'next/server'
import { logApiCall } from '@/lib/log-api-call'

// Book Summary 专用配置 - 书籍介绍机器人
// 使用环境变量中的 DIFY_API_KEY（这是真正的 API Key）
const DIFY_API_KEY = process.env.DIFY_API_KEY || ''
const DIFY_BOOK_SUMMARY_APP_ID = 'app-FMli5GdNfA9M1ErElR0HWXj8'
const DIFY_BASE_URL = 'https://api.dify.ai/v1'

export async function POST(request: NextRequest) {
  try {
    const { bookTitle, user_id } = await request.json()

    if (!bookTitle) {
      return NextResponse.json(
        { error: 'Book title is required' },
        { status: 400 }
      )
    }

    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { error: 'DIFY_API_KEY not configured' },
        { status: 500 }
      )
    }

    // 构建查询消息
    const queryMessage = `Please provide a brief introduction and summary of the book: ${bookTitle}. Include what the book is about, main themes, and key information that would help a student write a book review.`

    // Dify API configuration
    const url = `${DIFY_BASE_URL}/chat-messages`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIFY_API_KEY}`,
    }
    
    const requestBody: any = {
      inputs: {
        book_title: bookTitle,
      },
      query: queryMessage,
      response_mode: 'blocking',
      user: user_id || 'default-user',
      app_id: DIFY_BOOK_SUMMARY_APP_ID, // 指定使用正确的机器人
    }

    console.log('Dify Book Summary API Request:', JSON.stringify({
      url,
      app_id: DIFY_BOOK_SUMMARY_APP_ID,
      book_title: bookTitle,
    }, null, 2))

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Dify API error:', errorText)
      return NextResponse.json(
        { error: `Dify API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    const message = data.answer || data.message || ''

    // 记录API调用
    await logApiCall(
      user_id || 'default-user',
      'bookReviewWriting',
      '/api/dify-book-summary',
      { bookTitle },
      { answer: message, conversation_id: data.conversation_id, message_id: data.id }
    )

    return NextResponse.json({
      message,
      conversationId: data.conversation_id,
      messageId: data.id,
    })
  } catch (error) {
    console.error('Book summary API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

