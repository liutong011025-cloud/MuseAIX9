// 共享的interactions存储模块
// 这个模块可以在服务器端和客户端之间共享interactions数组

interface Interaction {
  user_id: string
  timestamp: number
  stage: string
  input: any
  output: any
  api_calls: Array<{ endpoint: string; request: any; response: any }>
  story?: string
  review?: string
  reviewType?: "recommendation" | "critical" | "literary"
  bookTitle?: string
  bookCoverUrl?: string
  letter?: string
  recipient?: string
  occasion?: string
}

// 内存存储
let interactions: Interaction[] = []

// 导出函数来操作interactions
export function addInteraction(interaction: Omit<Interaction, 'timestamp'>): Interaction {
  const now = Date.now()
  
  // 对于review阶段，检查是否已经有相同的userId + stage + story的记录（避免重复）
  if (interaction.stage === 'review' && interaction.story) {
    const existingReview = interactions.find(
      i => i.user_id === interaction.user_id 
        && i.stage === 'review' 
        && i.story === interaction.story
    )
    
    if (existingReview) {
      // 如果已经存在相同的review记录，不重复添加
      console.log('Duplicate review interaction detected, skipping:', {
        userId: interaction.user_id,
        storyLength: interaction.story.length
      })
      return existingReview
    }
  }
  
  // 对于plot阶段，检查是否有最近的相同userId和stage的记录（30秒内），合并消息而不是创建新记录
  if (interaction.stage === 'plot' && interaction.input?.messages) {
    const recentPlotInteraction = interactions
      .filter(i => i.user_id === interaction.user_id && i.stage === 'plot')
      .filter(i => now - i.timestamp < 30000) // 30秒内的记录
      .sort((a, b) => b.timestamp - a.timestamp)[0] // 最新的

    if (recentPlotInteraction) {
      // 更新消息列表，使用新传入的完整消息列表（因为它包含所有消息）
      recentPlotInteraction.input = {
        ...recentPlotInteraction.input,
        messages: interaction.input.messages,
      }
      // 更新output（plotData）
      if (interaction.output) {
        recentPlotInteraction.output = {
          ...recentPlotInteraction.output,
          ...interaction.output,
        }
      }
      // 更新timestamp为当前时间
      recentPlotInteraction.timestamp = now
      console.log('Merged plot interaction:', {
        userId: interaction.user_id,
        messageCount: interaction.input.messages.length
      })
      return recentPlotInteraction
    }
  }
  
  const newInteraction: Interaction = {
    ...interaction,
    timestamp: now,
  }
  
  // 如果api_calls存在，尝试合并到最近的相同user_id和stage的interaction中（5秒内）
  if (interaction.api_calls && interaction.api_calls.length > 0) {
    const recentInteraction = interactions
      .filter(i => i.user_id === interaction.user_id && i.stage === interaction.stage)
      .filter(i => now - i.timestamp < 5000) // 5秒内的记录
      .sort((a, b) => b.timestamp - a.timestamp)[0] // 最新的

    if (recentInteraction) {
      // 合并API调用到现有记录
      recentInteraction.api_calls = [...(recentInteraction.api_calls || []), ...interaction.api_calls]
      return recentInteraction
    }
  }

  interactions.push(newInteraction)

  // 只保留最近1000条记录
  if (interactions.length > 1000) {
    interactions = interactions.slice(-1000)
  }

  return newInteraction
}

export function getInteractions(userId?: string): Interaction[] {
  let filteredInteractions = interactions

  if (userId) {
    filteredInteractions = interactions.filter(i => i.user_id === userId)
  }

  // 按时间倒序排列
  return filteredInteractions.sort((a, b) => b.timestamp - a.timestamp)
}

export function clearInteractions(): void {
  interactions = []
}

export function deleteInteraction(timestamp: number): boolean {
  const index = interactions.findIndex(i => i.timestamp === timestamp)
  if (index !== -1) {
    interactions.splice(index, 1)
    return true
  }
  return false
}

export function deleteEmptyBookReviews(): number {
  let deletedCount = 0
  interactions = interactions.filter(i => {
    // 如果是book review，检查内容长度
    if (i.stage === 'bookReviewComplete' || i.stage === 'bookReviewCompleteNoAi' || i.review) {
      const review = typeof i.review === 'string' ? i.review : (i.output?.review || i.data?.review || '')
      const reviewText = review.trim()
      // 如果内容少于50个字符，删除
      if (!reviewText || reviewText.length <= 50) {
        deletedCount++
        return false
      }
    }
    return true
  })
  return deletedCount
}

// 直接记录API调用
export function logApiCallDirect(
  userId: string,
  stage: string,
  endpoint: string,
  request: any,
  response: any
): void {
  if (!userId) {
    console.warn('logApiCallDirect: No userId provided, skipping log')
    return
  }

  try {
    addInteraction({
      user_id: userId,
      stage: stage,
      input: {},
      output: {},
      api_calls: [
        {
          endpoint: endpoint,
          request: request,
          response: response,
        },
      ],
    })
    
    console.log('API call logged directly:', {
      userId,
      stage,
      endpoint,
    })
  } catch (error) {
    console.error('Error logging API call directly:', error)
  }
}

