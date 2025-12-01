import { NextRequest, NextResponse } from 'next/server'

const DIFY_API_KEY = process.env.DIFY_API_KEY || ''
const DIFY_WRITING_APP_ID = 'app-IKvkbOgKstyjEupEpbpu2iPF'
const DIFY_BASE_URL = 'https://api.dify.ai/v1'

export async function POST(request: NextRequest) {
  try {
    const { text, character, plot, structure, user_id } = await request.json()

    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { error: 'DIFY_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Build context from character, plot, and structure
    const context = `
Character: ${character?.name || 'Unknown'}, Age: ${character?.age || 'Unknown'}, Traits: ${character?.traits?.join(', ') || 'None'}, Description: ${character?.description || 'None'}
Plot: Setting: ${plot?.setting || 'Unknown'}, Conflict: ${plot?.conflict || 'Unknown'}, Goal: ${plot?.goal || 'Unknown'}
Structure: ${structure?.type || 'Unknown'}, Outline: ${structure?.outline?.join(' -> ') || 'None'}
Current text: ${text || ''}
`.trim()

    const url = `${DIFY_BASE_URL}/chat-messages`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIFY_API_KEY}`,
    }
    
    // Build request body
    const requestBody: any = {
      inputs: {
        character_info: JSON.stringify(character || {}),
        plot_info: JSON.stringify(plot || {}),
        structure_info: JSON.stringify(structure || {}),
        current_text: text || '',
      },
      query: `Please provide writing suggestions based on this context: ${context}`,
      response_mode: 'blocking',
      user: user_id || 'default-user',
      app_id: DIFY_WRITING_APP_ID, // 指定使用正确的机器人
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Dify API error:', errorText)
      return NextResponse.json(
        { error: `Dify API error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      answer: data.answer || '',
      suggestion: data.answer || '',
    })
  } catch (error) {
    console.error('Error calling Dify API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

