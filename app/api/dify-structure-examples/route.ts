import { NextRequest, NextResponse } from 'next/server'
import { logApiCall } from '@/lib/log-api-call'

const DIFY_STRUCTURE_APP_ID = 'app-UxoYLEHygZGu8ZaHIl8jdNf7'
const DIFY_API_KEY = process.env.DIFY_API_KEY || ''
const DIFY_BASE_URL = 'https://api.dify.ai/v1'
// 直接在代码中配置 FAL Key（不依赖环境变量）
const FAL_KEY = 'fe7aa0cd-770b-4637-ab05-523a332169b4:dca9c9ff8f073a4c33704236d8942faa'
const FAL_API_ENDPOINT = 'https://fal.run/fal-ai/nano-banana'

export async function POST(request: NextRequest) {
  try {
    const { structure_type, character, plot, user_id, generate_all } = await request.json()

    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { error: 'DIFY_API_KEY not configured' },
        { status: 500 }
      )
    }

    // 调试：打印 character 对象
    console.log('Character object received:', JSON.stringify(character, null, 2))
    console.log('Character species:', character?.species)
    
    // 构建角色和情节信息
    const characterInfo = [
      `Character name: ${character?.name || 'Unknown'}`,
      character?.species ? `Species: ${character.species}` : '',
      character?.age ? `Age: ${character.age} years old` : '',
      character?.traits && character.traits.length > 0 ? `Traits: ${character.traits.join(', ')}` : '',
      character?.description ? `Description: ${character.description}` : '',
    ].filter(Boolean).join('\n')

    const plotInfo = [
      `Setting: ${plot?.setting || 'Unknown'}`,
      `Conflict: ${plot?.conflict || 'Unknown'}`,
      `Goal: ${plot?.goal || 'Unknown'}`,
    ].filter(Boolean).join('\n')

    // 如果generate_all为true，一次性生成所有三个结构的故事
    if (generate_all) {
      const prompt = `根据我输入的人物和情节，生成简短的实例故事，分别为Freytag's Pyramid结构、Three Act Structure结构、Fichtean Curve结构。

人物信息：
${characterInfo}

情节信息：
${plotInfo}

请生成三个简短的故事（每个3-5句话），分别使用以下三种结构：
1. Freytag's Pyramid（起承转合结构）
2. Three Act Structure（三幕结构）
3. Fichtean Curve（多危机结构）

请按照以下格式输出，每个故事之间用"---"分隔：
**Freytag's Pyramid:**
[故事内容]

**Three Act Structure:**
[故事内容]

**Fichtean Curve:**
[故事内容]

所有故事都应适合儿童阅读，有趣且引人入胜。`

      console.log('Calling Dify API for all structure examples')
      console.log('Prompt:', prompt)

      const url = `${DIFY_BASE_URL}/chat-messages`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`,
      }

      const requestBody: any = {
        inputs: {
          character_info: JSON.stringify(character || {}),
          plot_info: JSON.stringify(plot || {}),
        },
        query: prompt,
        response_mode: 'blocking',
        user: user_id || 'default-user',
        app_id: DIFY_STRUCTURE_APP_ID, // 指定使用正确的机器人
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Dify API error:', errorText)
          throw new Error('Failed to generate stories')
        }

        const data = await response.json()
        let allStories = data.answer || data.text || ''

        // 移除最后六个单词（AI的提示词，通常是逗号分隔的单词）
        // 匹配格式：单词1, 单词2, 单词3, 单词4, 单词5, 单词6.
        const sixWordsPattern = /[,\s]*[a-zA-Z]+[,\s]+[a-zA-Z]+[,\s]+[a-zA-Z]+[,\s]+[a-zA-Z]+[,\s]+[a-zA-Z]+[,\s]+[a-zA-Z]+[.\s]*$/i
        allStories = allStories.replace(sixWordsPattern, '').trim()

        console.log('All stories after removing six words:', allStories)

        // 解析AI返回的内容，拆分为三个故事
        const stories: Record<string, string> = {}
        
        // 改进正则表达式，匹配 **Freytag's Pyramid:** 或 Freytag's Pyramid: 格式
        // 匹配到下一个 ** 或结构名称之前的内容
        const freytagMatch = allStories.match(/\*\*?Freytag'?s?\s+Pyramid:?\*\*?\s*\n?\s*([\s\S]*?)(?=\*\*?(?:Three\s+Act|Fichtean)|$)/i)
        const threeActMatch = allStories.match(/\*\*?Three\s+Act\s+Structure:?\*\*?\s*\n?\s*([\s\S]*?)(?=\*\*?Fichtean|$)/i)
        const fichteanMatch = allStories.match(/\*\*?Fichtean\s+Curve:?\*\*?\s*\n?\s*([\s\S]*?)$/i)

        // 如果没有匹配到，尝试不带 ** 的格式
        if (!freytagMatch) {
          const altMatch = allStories.match(/Freytag'?s?\s+Pyramid:?\s*\n?\s*([\s\S]*?)(?=Three\s+Act|Fichtean|$)/i)
          if (altMatch) {
            stories.freytag = altMatch[1].trim()
          }
        } else {
          stories.freytag = freytagMatch[1].trim()
        }

        if (!threeActMatch) {
          const altMatch = allStories.match(/Three\s+Act\s+Structure:?\s*\n?\s*([\s\S]*?)(?=Fichtean|$)/i)
          if (altMatch) {
            stories.threeAct = altMatch[1].trim()
          }
        } else {
          stories.threeAct = threeActMatch[1].trim()
        }

        if (!fichteanMatch) {
          const altMatch = allStories.match(/Fichtean\s+Curve:?\s*\n?\s*([\s\S]*?)$/i)
          if (altMatch) {
            stories.fichtean = altMatch[1].trim()
          }
        } else {
          stories.fichtean = fichteanMatch[1].trim()
        }

        // 清理每个故事：移除可能的结构名称前缀和多余的空行
        const cleanStory = (story: string) => {
          if (!story) return ''
          // 移除开头的结构名称（如果存在）
          story = story.replace(/^(Freytag'?s?\s+Pyramid|Three\s+Act\s+Structure|Fichtean\s+Curve):?\s*/i, '')
          // 移除开头的 Act 1: Act 2: Act 3: 等标记（保留内容）
          story = story.replace(/^Act\s+\d+:\s*/gi, '')
          // 移除多余的空行
          story = story.replace(/\n{3,}/g, '\n\n').trim()
          return story
        }

        stories.freytag = cleanStory(stories.freytag || '')
        stories.threeAct = cleanStory(stories.threeAct || '')
        stories.fichtean = cleanStory(stories.fichtean || '')

        console.log('Parsed stories:', {
          freytag: stories.freytag.substring(0, 50) + '...',
          threeAct: stories.threeAct.substring(0, 50) + '...',
          fichtean: stories.fichtean.substring(0, 50) + '...'
        })

        // 如果仍然没有解析到，使用默认故事
        const defaultStory = `Once upon a time, ${character?.name || 'a hero'} lived in ${plot?.setting || 'a magical place'}. They faced ${plot?.conflict || 'a challenge'} and worked hard to ${plot?.goal || 'achieve their goal'}. In the end, they succeeded and learned an important lesson.`
        
        const result = {
          freytag: {
            story: stories.freytag || defaultStory,
            structure_type: 'freytag',
          },
          threeAct: {
            story: stories.threeAct || defaultStory,
            structure_type: 'threeAct',
          },
          fichtean: {
            story: stories.fichtean || defaultStory,
            structure_type: 'fichtean',
          },
        }

        return NextResponse.json(result)
      } catch (difyError) {
        console.error('Error calling Dify API:', difyError)
        throw difyError
      }
    }

    // 单个结构的故事生成（保持向后兼容）
    const structureNames: Record<string, string> = {
      'freytag': "Freytag's Pyramid",
      'threeAct': "Three Act Structure",
      'fichtean': "Fichtean Curve",
    }

    const structureName = structureNames[structure_type] || structure_type

    // 调用Dify API生成单个故事
    const prompt = `根据我输入的人物和情节，生成简短的实例故事，使用${structureName}结构。

人物信息：
${characterInfo}

情节信息：
${plotInfo}

请生成一个简短的故事（3-5句话），使用${structureName}结构，适合儿童阅读，有趣且引人入胜。`

    console.log('Calling Dify API for structure example:', structure_type)
    console.log('Prompt:', prompt)

    const url = `${DIFY_BASE_URL}/chat-messages`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIFY_API_KEY}`,
    }

    const requestBody: any = {
      inputs: {
        character_info: JSON.stringify(character || {}),
        plot_info: JSON.stringify(plot || {}),
        structure_type: structure_type,
      },
      query: prompt,
      response_mode: 'blocking',
      app_id: DIFY_STRUCTURE_APP_ID, // 指定使用正确的机器人
      user: user_id || 'default-user',
    }

    let exampleStory = ''
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Dify API error:', errorText)
        // 如果API调用失败，使用默认故事
        exampleStory = `Once upon a time, ${character?.name || 'a hero'} lived in ${plot?.setting || 'a magical place'}. They faced ${plot?.conflict || 'a challenge'} and worked hard to ${plot?.goal || 'achieve their goal'}. In the end, they succeeded and learned an important lesson.`
      } else {
        const data = await response.json()
        exampleStory = data.answer || data.text || ''
        
        // 如果AI返回为空，使用默认故事
        if (!exampleStory || exampleStory.trim() === '') {
          exampleStory = `Once upon a time, ${character?.name || 'a hero'} lived in ${plot?.setting || 'a magical place'}. They faced ${plot?.conflict || 'a challenge'} and worked hard to ${plot?.goal || 'achieve their goal'}. In the end, they succeeded and learned an important lesson.`
        }
      }
    } catch (difyError) {
      console.error('Error calling Dify API:', difyError)
      // 如果API调用失败，使用默认故事
      exampleStory = `Once upon a time, ${character?.name || 'a hero'} lived in ${plot?.setting || 'a magical place'}. They faced ${plot?.conflict || 'a challenge'} and worked hard to ${plot?.goal || 'achieve their goal'}. In the end, they succeeded and learned an important lesson.`
    }

    // Generate image for the story using fal.ai
    let imageUrl = ''
    try {
      // 构建图片提示词，包含物种信息
      console.log('Building image prompt, character species:', character?.species)
      const speciesInfo = character?.species 
        ? (character.species === "Boy" || character.species === "Girl" 
          ? `a young ${character.species.toLowerCase()}` 
          : `a ${character.species.toLowerCase()}`)
        : 'a character'
      const imagePrompt = `A charming illustration for a children's story: ${speciesInfo} named ${character?.name || 'a character'} in ${plot?.setting || 'a setting'}, ${plot?.conflict || 'facing a challenge'}. Colorful, friendly, and suitable for children.`
      console.log('Image prompt:', imagePrompt)
      
      // FAL_KEY 已在代码中硬编码，直接使用
      {
        const imageResponse = await fetch(FAL_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Key ${FAL_KEY}`,
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            num_images: 1,
            output_format: 'jpeg',
            aspect_ratio: '16:9', // 使用横向比例，更适合容器显示
            sync_mode: true,
          }),
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          imageUrl = imageData.images?.[0]?.url || ''
          if (!imageUrl) {
            console.warn('No image URL in response, using placeholder')
            imageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${character?.name || 'story'}`
          }
        } else {
          const errorText = await imageResponse.text()
          console.error('Fal.ai image generation failed:', imageResponse.status, errorText)
          // 如果API调用失败，使用占位符
          imageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${character?.name || 'story'}`
        }
      }
    } catch (imageError) {
      console.error('Error generating image:', imageError)
      // 如果发生错误，使用占位符作为后备方案
      imageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${character?.name || 'story'}`
    }

    return NextResponse.json({
      story: exampleStory,
      imageUrl: imageUrl,
      structure_type: structure_type,
    })
  } catch (error) {
    console.error('Error generating structure example:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

