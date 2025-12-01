import { NextRequest, NextResponse } from 'next/server'
import { logApiCall } from '@/lib/log-api-call'

// 直接在代码中配置 FAL Key（不依赖环境变量）
const FAL_KEY = 'fe7aa0cd-770b-4637-ab05-523a332169b4:dca9c9ff8f073a4c33704236d8942faa'
const FAL_API_ENDPOINT = 'https://fal.run/fal-ai/nano-banana'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const bookTitle = body.bookTitle
    const userId = body.user_id

    if (!bookTitle || typeof bookTitle !== 'string' || bookTitle.trim() === '') {
      return NextResponse.json(
        { error: 'Book title cannot be empty' },
        { status: 400 }
      )
    }

    // FAL_KEY 已在代码中硬编码，无需检查

    // 生成拟真风格的书封面，正对视角，不倾斜
    const prompt = `Professional book cover for "${bookTitle}". Realistic hardcover book, front view, straight perspective, no tilt or angle. Elegant typography on front cover, realistic textures, bookstore quality, professional book design.`

    const requestBody = {
      prompt: prompt.trim(),
      num_images: 1,
      output_format: 'jpeg',
      aspect_ratio: '2:3', // 书封面比例
      sync_mode: true,
    }

    console.log('=== Generating Book Cover ===')
    console.log('Book Title:', bookTitle)
    console.log('FAL API Endpoint:', FAL_API_ENDPOINT)
    console.log('Request Body:', JSON.stringify(requestBody, null, 2))
    console.log('FAL_KEY configured:', !!FAL_KEY)
    console.log('============================')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)

    try {
      const response = await fetch(FAL_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${FAL_KEY}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })
      
      console.log('FAL API Response Status:', response.status, response.statusText)

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Fal.ai API error:', response.status, errorData)
        return NextResponse.json(
          { error: `Failed to generate book cover (${response.status}): ${errorData}` },
          { status: response.status }
        )
      }

      const result = await response.json()
      console.log('FAL API Response:', JSON.stringify(result, null, 2))
      
      const imageUrl = result.images?.[0]?.url || null
      console.log('Extracted Image URL:', imageUrl)

      if (!imageUrl) {
        console.error('No image URL in response. Full response:', JSON.stringify(result, null, 2))
        return NextResponse.json(
          { error: 'Failed to get image URL from response. Response: ' + JSON.stringify(result) },
          { status: 500 }
        )
      }

      // 记录API调用
      await logApiCall(
        userId,
        'bookReviewWriting',
        '/api/generate-book-cover (Fal.ai)',
        { bookTitle },
        { imageUrl }
      )

      return NextResponse.json({ 
        imageUrl,
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Image generation timeout. Please try again.' },
          { status: 504 }
        )
      }
      throw fetchError
    }

  } catch (error) {
    console.error('Error generating book cover:', error)
    return NextResponse.json(
      { error: 'Server error. Please try again later.' },
      { status: 500 }
    )
  }
}

