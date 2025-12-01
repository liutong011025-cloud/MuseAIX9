import { NextRequest, NextResponse } from 'next/server'

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1'
// 使用环境变量中的 DIFY_API_KEY（这是真正的 API Key，不是 App ID）
const DIFY_API_KEY = process.env.DIFY_API_KEY || ''
// App ID 是编辑助手的机器人 ID
const DIFY_EDIT_ASSISTANT_APP_ID = 'app-gZpvq3GiPCZ0D0JPmrxH00jF'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      article_type, // 'story', 'review', 'letter'
      original_content, // 原始文章内容
      modified_content, // 修改后的内容
      modified_section, // 修改的部分（可选）
      user_id,
    } = body

    if (!original_content || !modified_content) {
      return NextResponse.json(
        { error: 'original_content and modified_content are required' },
        { status: 400 }
      )
    }

    if (!DIFY_API_KEY) {
      console.error('DIFY_API_KEY not configured')
      return NextResponse.json(
        { error: 'DIFY_API_KEY not configured' },
        { status: 500 }
      )
    }

    // 构建提示词，让AI提供修改建议
    const prompt = `You are Muse, a friendly and encouraging elementary school English writing teacher assistant. A student has made some changes to their ${article_type}. 

Original content:
${original_content}

Modified content:
${modified_content}

${modified_section ? `The student modified this section: ${modified_section}` : ''}

IMPORTANT: Analyze the content carefully. If the content is just test words (like "test", "testtest", random letters, or placeholder text), do NOT praise it. Instead, gently encourage them to write real content. Only praise when there is actual meaningful writing.

Please provide helpful, encouraging feedback and suggestions for improvement. Use a friendly, warm tone suitable for elementary school students. Include emojis to make it more engaging. 

Guidelines:
1. If the content is meaningful and shows effort: Praise what they did well, then give specific suggestions
2. If the content is just test/placeholder text: Gently encourage them to write real content, don't praise test content
3. Always provide specific, actionable suggestions for improvement
4. Be encouraging but honest - don't give false praise

Do NOT rewrite the entire article. Only provide feedback and suggestions. Keep your response concise (around 50-80 words). Be conversational and warm, like a caring teacher.`

    const url = `${DIFY_BASE_URL}/chat-messages`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIFY_API_KEY}`,
    }

    const requestBody: any = {
      inputs: {
        article_type: article_type || 'story',
        original_content: original_content,
        modified_content: modified_content,
        modified_section: modified_section || '',
      },
      query: prompt,
      response_mode: 'blocking',
      user: user_id || 'default-user',
      app_id: DIFY_EDIT_ASSISTANT_APP_ID,
    }

    console.log('Edit Assistant API Request:', JSON.stringify({
      url,
      app_id: DIFY_EDIT_ASSISTANT_APP_ID,
      user: user_id,
      article_type,
    }, null, 2))

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Dify API Error:', errorText)
      return NextResponse.json(
        { error: `Dify API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiResponse = data.answer || data.message || ''

    return NextResponse.json({
      success: true,
      suggestion: aiResponse,
    })
  } catch (error) {
    console.error('Edit Assistant API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

