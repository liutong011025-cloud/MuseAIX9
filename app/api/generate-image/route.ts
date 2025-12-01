import { NextRequest, NextResponse } from 'next/server'
import { logApiCall } from '@/lib/log-api-call'

// 直接在代码中配置 FAL Key（不依赖环境变量）
const FAL_KEY = 'fe7aa0cd-770b-4637-ab05-523a332169b4:dca9c9ff8f073a4c33704236d8942faa'
const FAL_API_ENDPOINT = 'https://fal.run/fal-ai/nano-banana'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prompt = body.prompt
    const aspectRatio = body.aspect_ratio || '1:1' // 允许从请求中指定宽高比
    const userId = body.user_id // 从请求中获取user_id
    const stage = body.stage || 'character' // 从请求中获取stage，默认为character

    console.log('Received prompt:', prompt)
    console.log('Prompt type:', typeof prompt)
    console.log('Prompt length:', prompt?.length)
    console.log('Aspect ratio:', aspectRatio)

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      console.error('Invalid prompt:', prompt)
      return NextResponse.json(
        { error: 'Prompt cannot be empty' },
        { status: 400 }
      )
    }

    // FAL_KEY 已在代码中硬编码，无需检查

    const requestBody = {
      prompt: prompt.trim(),
      num_images: 1,
      output_format: 'jpeg',
      aspect_ratio: aspectRatio, // 使用请求中指定的宽高比
      sync_mode: true, // 同步模式，直接返回结果
    }

    console.log('Sending request to fal.ai:')
    console.log('Endpoint:', FAL_API_ENDPOINT)
    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    // 使用 fal.ai API 生成图片，增加超时时间
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 120秒超时

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

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Fal.ai API error:', response.status, errorData)
        return NextResponse.json(
          { error: `Failed to generate image (${response.status}): ${errorData}` },
          { status: response.status }
        )
      }

      const result = await response.json()
      console.log('Fal.ai response:', JSON.stringify(result, null, 2))
      
      // 提取图片URL
      const imageUrl = result.images?.[0]?.url || null
      
      if (!imageUrl) {
        console.error('No image URL in response:', JSON.stringify(result, null, 2))
        return NextResponse.json(
          { error: 'Failed to get image URL from response. Response: ' + JSON.stringify(result) },
          { status: 500 }
        )
      }
      
      // 记录API调用
      await logApiCall(
        userId,
        stage,
        '/api/generate-image (Fal.ai)',
        { prompt, aspect_ratio: aspectRatio },
        { imageUrl, description: result.description }
      )
      
      return NextResponse.json({ 
        imageUrl,
        description: result.description || ''
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
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Server error. Please try again later.' },
      { status: 500 }
    )
  }
}

