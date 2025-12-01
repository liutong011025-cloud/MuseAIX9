import { NextRequest, NextResponse } from 'next/server'

// 直接在代码中配置 FAL Key（不依赖环境变量）
const FAL_KEY = 'fe7aa0cd-770b-4637-ab05-523a332169b4:dca9c9ff8f073a4c33704236d8942faa'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipient, occasion } = body

    console.log('=== Generating Letter Reader Image ===')
    console.log('Recipient:', recipient)
    console.log('Occasion:', occasion)
    console.log('FAL_KEY configured:', !!FAL_KEY)

    if (!recipient || !occasion) {
      console.error('Missing recipient or occasion')
      return NextResponse.json(
        { error: 'Recipient and occasion are required' },
        { status: 400 }
      )
    }

    // 使用 fal.ai 生成收信人读信的照片，读信人必须是学生自定义的recipient
    const prompt = `${recipient} reading a letter, occasion: ${occasion}, realistic photo, sharp focus`

    console.log('Prompt:', prompt)
    console.log('Using endpoint: https://fal.run/fal-ai/nano-banana')

    // 改用 nano-banana 端点，和其他图片生成保持一致
    const requestBody = {
      prompt: prompt.trim(),
      num_images: 1,
      output_format: 'jpeg',
      aspect_ratio: '1:1', // 正方形
      sync_mode: true, // 同步模式
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 120秒超时

    try {
      const response = await fetch('https://fal.run/fal-ai/nano-banana', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${FAL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('FAL API Response Status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Fal.ai API error:', response.status, errorText)
        return NextResponse.json(
          { error: `Failed to generate image (${response.status}): ${errorText}`, imageUrl: null },
          { status: response.status }
        )
      }

      const data = await response.json()
      console.log('FAL API Response:', JSON.stringify(data, null, 2))
      
      // fal.ai nano-banana 返回格式通常是 { images: [{ url: ... }] }
      let imageUrl = null
      
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        imageUrl = data.images[0].url || data.images[0]
      } else if (data.image && data.image.url) {
        imageUrl = data.image.url
      } else if (data.url) {
        imageUrl = data.url
      } else if (typeof data === 'string') {
        imageUrl = data
      }

      console.log('Extracted Image URL:', imageUrl)

      if (!imageUrl) {
        console.error('No image URL in response. Full response:', JSON.stringify(data, null, 2))
        return NextResponse.json(
          { error: 'Failed to get image URL from response', imageUrl: null },
          { status: 500 }
        )
      }

      return NextResponse.json({ imageUrl })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.error('Image generation timeout')
        return NextResponse.json(
          { error: 'Image generation timeout. Please try again.', imageUrl: null },
          { status: 504 }
        )
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Error generating letter reader image:', error)
    // 返回 null 而不是抛出错误
    return NextResponse.json({ imageUrl: null })
  }
}


