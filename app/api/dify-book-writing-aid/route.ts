import { NextRequest, NextResponse } from 'next/server'
import { logApiCall } from '@/lib/log-api-call'

// Book Writing Aid 专用配置
// 使用环境变量中的 DIFY_API_KEY（这是真正的 API Key）
const DIFY_API_KEY = process.env.DIFY_API_KEY || ''
const DIFY_BOOK_WRITING_AID_APP_ID = 'app-9Qbo41jL3RuXmArfN7doaHvl'
const DIFY_BASE_URL = 'https://api.dify.ai/v1'

export async function POST(request: NextRequest) {
  try {
    const { text, reviewType, bookTitle, structure, currentSection, user_id } = await request.json()

    if (!text || !reviewType || !bookTitle) {
      return NextResponse.json(
        { error: 'Text, review type, and book title are required' },
        { status: 400 }
      )
    }

    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { error: 'DIFY_API_KEY not configured' },
        { status: 500 }
      )
    }

    // 获取当前section名称
    const currentSectionName = currentSection !== undefined ? structure?.outline?.[currentSection] || '' : ''

    // 构建查询消息 - 降低通过标准
    const queryMessage = `You are Muse, a friendly book review writing teacher for elementary students.

Student is writing a ${reviewType} review for the book: "${bookTitle}"
Current section: "${currentSectionName}"
Student's writing: "${text || ''}"

EVALUATION RULES:
1. Give brief, encouraging feedback (1-2 sentences) with emojis ✨
2. Be supportive and encouraging
3. EVALUATE BASED ON CONTENT QUALITY, NOT WORD COUNT:
   - Different sections have different length expectations:
     * Introduction: Usually 1-2 sentences to introduce the book
     * Body sections: Usually 2-3+ sentences with some details
     * Conclusion: Usually 1-2 sentences to wrap up
   - Focus on whether the writing:
     * Makes basic sense and is readable
     * Relates to the section and book
     * Shows some effort
     * Fulfills the basic purpose of the section
4. Say "you can move to the next part" when:
   - The content is meaningful and makes sense
   - The writing relates to the section and book
   - The writing shows reasonable effort
   - The writing is NOT just random characters or complete gibberish
   - The writing fulfills the basic purpose of the ${currentSectionName} section
5. Be generous - approve if the student has written something reasonable, even if it's brief
6. Only reject if:
   - Text is completely random characters or gibberish
   - Text has no relation to the book or section at all
   - Text is completely empty or just placeholder text

Remember: Be encouraging and supportive. Approve reasonable writing that shows effort, even if brief. Only say "you can move to the next part" when the writing is good enough for its purpose.`

    // Dify API configuration
    const url = `${DIFY_BASE_URL}/chat-messages`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIFY_API_KEY}`,
    }
    
    const requestBody: any = {
      inputs: {
        review_type: reviewType,
        book_title: bookTitle,
        current_section: currentSectionName,
        student_writing: text || '',
      },
      query: queryMessage,
      response_mode: 'blocking',
      user: user_id || 'default-user',
      app_id: DIFY_BOOK_WRITING_AID_APP_ID, // 指定使用正确的机器人
    }

    console.log('Dify Book Writing Aid API Request:', JSON.stringify({
      url,
      app_id: DIFY_BOOK_WRITING_AID_APP_ID,
      review_type: reviewType,
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
    // Dify API 可能返回 answer 或 message 字段
    const message = data.answer || data.message || data.text || ''

    // 记录API调用
    await logApiCall(
      user_id || 'default-user',
      'bookReviewWriting',
      '/api/dify-book-writing-aid',
      { text, reviewType, bookTitle, structure, currentSection },
      { answer: message, conversation_id: data.conversation_id, message_id: data.id }
    )

    return NextResponse.json({
      message,
      conversationId: data.conversation_id,
      messageId: data.id,
    })
  } catch (error) {
    console.error('Book writing aid API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

