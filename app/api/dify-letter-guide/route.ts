import { NextRequest, NextResponse } from 'next/server'
import { logApiCall } from '@/lib/log-api-call'

// Letter Guide 专用配置
// 使用环境变量中的 DIFY_API_KEY（这是真正的 API Key）
const DIFY_API_KEY = process.env.DIFY_API_KEY || ''
const DIFY_LETTER_APP_ID = 'app-3iAjb8MCQEXkUxcjvky6lhXt'

// 检测文本是否为乱码或无意义内容
function isGibberishOrMeaningless(text: string): boolean {
  if (!text || text.trim().length < 3) return false // 太短不判断
  
  const trimmed = text.trim()
  
  // 检测重复字符（如 "aaaa" 或 "1111"）
  const repeatedCharPattern = /(.)\1{4,}/g
  if (repeatedCharPattern.test(trimmed)) {
    return true
  }
  
  // 检测随机字符组合（如 "asdfgh" 或 "qwerty"）
  const randomPatterns = [
    /^[qwertyuiopasdfghjklzxcvbnm]{6,}$/i, // 键盘随机敲击
    /^[asdf]{4,}$/i, // 重复按键
    /^[zxcv]{4,}$/i,
  ]
  if (randomPatterns.some(pattern => pattern.test(trimmed))) {
    return true
  }
  
  // 检测是否全是标点符号或特殊字符
  const onlyPunctuation = /^[^\w\u4e00-\u9fff\s]+$/
  if (onlyPunctuation.test(trimmed)) {
    return true
  }
  
  // 检测是否包含太多无意义的字符组合
  const meaninglessRatio = (trimmed.match(/[^a-zA-Z0-9\u4e00-\u9fff\s.,!?;:'"-]/g) || []).length / trimmed.length
  if (meaninglessRatio > 0.5 && trimmed.length > 10) {
    return true
  }
  
  return false
}

// 检测文本是否有基本的意义（至少包含一些常见单词或中文）
function hasBasicMeaning(text: string): boolean {
  if (!text || text.trim().length < 5) return false
  
  const trimmed = text.trim()
  
  // 检查是否包含中文
  if (/[\u4e00-\u9fff]/.test(trimmed)) {
    return trimmed.length >= 3 // 至少3个中文字符
  }
  
  // 检查是否包含常见英文单词（至少2-3个单词）
  const words = trimmed.split(/\s+/).filter(w => w.length > 0)
  if (words.length < 2) {
    return false
  }
  
  // 检查是否有足够的字母字符（不是全是数字或符号）
  const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length
  if (letterCount < 5) {
    return false
  }
  
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipient, occasion, currentSection, currentText, user_id } = body

    if (!DIFY_API_KEY) {
      console.error('DIFY_API_KEY not configured')
      return NextResponse.json(
        { error: 'DIFY_API_KEY not configured' },
        { status: 500 }
      )
    }

    // 先进行基本的乱码检测
    const textToCheck = currentText || ''
    const isGibberish = isGibberishOrMeaningless(textToCheck)
    const hasMeaning = hasBasicMeaning(textToCheck)
    
    // 如果检测到乱码，直接返回拒绝消息
    if (isGibberish || !hasMeaning) {
      console.log('Letter Guide - Detected gibberish or meaningless text:', {
        text: textToCheck.substring(0, 50),
        isGibberish,
        hasMeaning
      })
      
      return NextResponse.json({
        message: `I see you're trying to write, but this doesn't look like meaningful text yet. Please write something real about ${currentSection.toLowerCase()} for ${recipient}. Try to express your thoughts clearly! ✨`
      })
    }

    // 构建简短的提示词 - 结合机器人预设提示词（机器人已知道：是小学英语写作老师，参照接收人和契机评价，只有足够完整才说done，test1-test5直接done）
    // 这里只需要补充当前上下文和严格拒绝乱码的标准
    const queryMessage = `Student writing to: "${recipient}", Reason: "${occasion}", Section: "${currentSection}", Text: "${currentText || 'Just starting...'}"

CRITICAL: Only say "you can move to the next part" when text is meaningful, grammatically correct, relevant to section, and shows real effort. STRICTLY REJECT gibberish, random characters, keyboard mashing, or meaningless text. Give brief feedback with emojis.`

    const response = await fetch(`https://api.dify.ai/v1/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: queryMessage,
        response_mode: 'blocking',
        conversation_id: '',
        user: user_id || 'student',
        app_id: DIFY_LETTER_APP_ID, // 指定使用正确的机器人
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Dify API error:', response.status, errorText)
      throw new Error(`Dify API error: ${response.status}`)
    }

    const data = await response.json()
    const message = data.answer || data.message || data.text || "Keep writing! You're doing great! ✨"

    // 记录 API 调用
    try {
      await logApiCall(
        user_id,
        'letterGuide',
        '/api/dify-letter-guide',
        { recipient, occasion, currentSection },
        { message }
      )
    } catch (logError) {
      console.error('Error logging API call:', logError)
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error in letter guide API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

