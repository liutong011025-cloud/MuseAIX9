// 辅助函数：记录API调用到interactions API
// 这个函数会尝试将API调用合并到最近的相同user_id和stage的interaction中（5秒内）
// 在服务器端直接使用共享存储，在客户端使用HTTP请求
import { logApiCallDirect } from './interactions-store'

export async function logApiCall(
  userId: string | undefined,
  stage: string,
  endpoint: string,
  request: any,
  response: any
) {
  if (!userId) {
    console.warn('logApiCall: No userId provided, skipping log')
    return // 如果没有userId，不记录
  }

  // 检查是否在服务器端（Node.js环境）
  const isServer = typeof window === 'undefined'
  
  if (isServer) {
    // 服务器端：直接使用共享存储
    try {
      logApiCallDirect(userId, stage, endpoint, request, response)
    } catch (error) {
      console.error('Error logging API call directly:', error)
    }
  } else {
    // 客户端：使用HTTP请求
    try {
      const responseData = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      })

      if (!responseData.ok) {
        const errorText = await responseData.text()
        console.error('Error logging API call - response not ok:', {
          status: responseData.status,
          statusText: responseData.statusText,
          error: errorText,
        })
        return
      }

      const result = await responseData.json()
      console.log('API call logged successfully:', {
        userId,
        stage,
        endpoint,
        success: result.success,
      })
    } catch (error) {
      console.error('Error logging API call:', error)
    }
  }
}

