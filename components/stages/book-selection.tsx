"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Image from "next/image"
import type { Language } from "@/app/page"

interface BookSelectionProps {
  language?: Language
  reviewType: "recommendation" | "critical" | "literary"
  onBookSelected?: (bookTitle: string) => void
  onBack?: () => void
}

const translations = {
  en: {
    back: "← Back",
    enterTitle: "Please enter a book title",
    enterTitleFirst: "Please enter a book title first",
    chooseButton: "Choose This Book",
    reviewTypeNames: {
      recommendation: "Recommendation Review",
      critical: "Critical Review",
      literary: "Literary Review"
    },
  },
  zh: {
    back: "← 返回",
    enterTitle: "請輸入書名",
    enterTitleFirst: "請先輸入書名",
    chooseButton: "選擇這本書",
    reviewTypeNames: {
      recommendation: "推薦書評",
      critical: "批判書評",
      literary: "文學書評"
    },
  },
}

export default function BookSelection({ language = "en", reviewType, onBookSelected, onBack }: BookSelectionProps) {
  const t = translations[language] || translations.en
  const [bookTitle, setBookTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [canContinue, setCanContinue] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isGeneratingCover, setIsGeneratingCover] = useState(false)

  const handleContinue = async () => {
    console.log('Choose This Book clicked, conversation:', conversation)
    
    // 找到最后一条用户消息（书名）
    const lastUserMessage = [...conversation].reverse().find(msg => msg.role === "user")
    
    if (!lastUserMessage || !lastUserMessage.content) {
      toast.error(t.enterTitleFirst)
      return
    }
    
    const bookTitle = lastUserMessage.content.trim()
    
    if (!bookTitle) {
      toast.error(t.enterTitleFirst)
      return
    }
    
    console.log('Calling onBookSelected with:', bookTitle)
    
    // 开始生成书封面（不等待）
    const generateCover = async () => {
      setIsGeneratingCover(true)
      try {
        // 在后台生成封面，不阻塞界面
        fetch("/api/generate-book-cover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookTitle: bookTitle, user_id: 'student' }),
        }).catch(err => console.error("Cover generation error:", err))
      } catch (error) {
        console.error("Error initiating cover generation:", error)
      } finally {
        setIsGeneratingCover(false)
      }
    }
    
    generateCover()
    
    // 调用回调函数
    if (onBookSelected) {
      onBookSelected(bookTitle)
    } else {
      console.error('onBookSelected callback is not defined')
      toast.error("Error: Callback not configured")
    }
  }

  const handleSend = async () => {
    if (!bookTitle.trim()) {
      toast.error(t.enterTitle)
      return
    }

    setIsLoading(true)
    const userMessage = bookTitle.trim()
    setConversation(prev => [...prev, { role: "user", content: userMessage }])
    setBookTitle("")

    try {
      const response = await fetch("/api/dify-book-selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewType,
          bookTitle: userMessage,
          conversation: conversation.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          conversation_id: conversationId,
          user_id: 'student',
        }),
      })

      if (!response.ok) {
        // 尝试获取详细的错误信息
        let errorMessage = "Failed to get AI response"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
          console.error("API Error Details:", errorData)
        } catch (e) {
          const errorText = await response.text()
          console.error("API Error Response:", errorText)
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const aiMessage = data.message || data.answer || ""

      console.log("Book Selection - AI Response:", aiMessage)
      console.log("Book Selection - Full Response Data:", data)

      // 更新conversation_id以保持对话上下文
      if (data.conversationId) {
        setConversationId(data.conversationId)
      }

      // 确保AI消息不为空才添加到对话
      if (aiMessage.trim()) {
        setConversation(prev => [...prev, { role: "assistant", content: aiMessage }])
      } else {
        console.warn("Book Selection - Empty AI message received")
        toast.error("AI response is empty. Please try again.")
      }

      // 检查是否包含"让我们开始写吧"的英文表达
      // 只有书合适时才能点击 choose 按钮
      const continuePhrases = [
        "let's start writing",
        "let's begin writing",
        "let's start writing now",
        "let's begin writing now",
        "ready to start writing",
        "let's write",
        "let's get started"
      ]
      
      const canProceed = continuePhrases.some(phrase => 
        aiMessage.toLowerCase().includes(phrase.toLowerCase())
      )
      
      // 只有明确说可以开始写时才能继续
      setCanContinue(canProceed)
    } catch (error) {
      console.error("Error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to get AI response. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen relative overflow-hidden" data-no-header style={{ overflowY: 'hidden' }}>
      {/* 图书馆背景图片 - 距离上边距有距离，渐变虚化 */}
      <div className="fixed inset-0 z-0 pt-16">
        <Image
          src="/library.png"
          alt="Library"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        {/* 顶部渐变虚化 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-50/30 pointer-events-none"></div>
        {/* 四周渐变虚化 */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-amber-50/20 pointer-events-none" 
             style={{
               background: 'radial-gradient(ellipse 80% 80% at center 50%, transparent 40%, rgba(251, 191, 36, 0.1) 70%, rgba(251, 191, 36, 0.2) 100%)'
             }}
        />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 h-screen px-6 lg:px-12 py-12 lg:py-20" style={{ paddingTop: '128px', overflowY: 'hidden' }}>
        {/* 返回按钮 - 再向下移动 */}
        {onBack && (
          <div className="mb-6 mt-24">
            <Button
              onClick={onBack}
              variant="outline"
              className="bg-white/80 backdrop-blur-lg border-2 border-gray-300 hover:bg-gray-50 text-gray-700 shadow-lg font-bold"
            >
              {t.back}
            </Button>
          </div>
        )}

        {/* 图书馆场景 */}
        <div className="max-w-7xl mx-auto">
          <div className="relative flex items-center justify-center" style={{ height: 'calc(100vh - 300px)', marginTop: '80px' }}>
            {/* 对话区域 - 两个对话框在同一垂直位置，管理员在上 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              {/* 等待AI回复时的思考特效 - 大一些，在管理员气泡位置，右上方 */}
              {isLoading && (
                <div className="absolute -left-24 z-35" style={{ top: '-550px' }}>
                  <div className="relative">
                    {/* 思考泡泡 - 更大 */}
                    <div className="bg-white/90 rounded-full p-4 shadow-lg border-2 border-amber-300">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 图书管理员的对话气泡 - 向上移动到-top-100，尖尖指向右边，在学生的上面 */}
              {(conversation.length === 0 || conversation.filter(msg => msg.role === "assistant").length > 0) && (
                <div className="absolute -left-32 z-30 w-80" style={{ top: '-550px' }}>
                  <div className="bg-amber-100 rounded-2xl p-5 shadow-xl border-2 border-amber-300 relative animate-fade-in">
                    <p className="text-base md:text-lg text-amber-900 leading-relaxed whitespace-pre-wrap">
                      {conversation.length === 0 
                        ? (language === "zh" 
                          ? `請選擇一本你想寫${t.reviewTypeNames[reviewType]}嘅書。`
                          : `Please choose a book you would like to write a ${t.reviewTypeNames[reviewType]} about.`)
                        : conversation.filter(msg => msg.role === "assistant").slice(-1)[0]?.content
                      }
                    </p>
                    {/* 气泡尾巴指向右边 */}
                    <div className="absolute right-0 top-1/3 translate-x-full w-0 h-0 border-l-[12px] border-l-amber-100 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                    <div className="absolute right-0 top-1/3 translate-x-full -translate-x-[1px] w-0 h-0 border-l-[12px] border-l-amber-300 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                  </div>
                </div>
              )}

              {/* 学生的对话气泡 - 再向上移动，尖尖指向左边，在管理员的下方 */}
              {conversation.filter(msg => msg.role === "user").length > 0 && (
                <div className="absolute -left-32 z-20 w-64" style={{ top: '-200px' }}>
                  <div className="bg-blue-100 rounded-2xl p-5 shadow-xl border-2 border-blue-300 relative animate-fade-in">
                    <p className="text-base md:text-lg text-blue-900 leading-relaxed whitespace-pre-wrap">
                      {conversation.filter(msg => msg.role === "user").slice(-1)[0]?.content}
                    </p>
                    {/* 气泡尾巴指向左边 */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-0 h-0 border-r-[12px] border-r-blue-100 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full translate-x-[1px] w-0 h-0 border-r-[12px] border-r-blue-300 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 输入框区域 - 美化样式，Choose This Book按钮在旁边，固定位置，向上移动避免遮挡 */}
          <div className="fixed left-1/2 -translate-x-1/2 z-40 max-w-5xl w-full px-6" style={{ bottom: '120px' }}>
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 border-2 border-amber-200 shadow-2xl">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Enter book title...</label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !isLoading) {
                        handleSend()
                      }
                    }}
                    placeholder="Type the book name here..."
                    className="w-full px-6 py-4 rounded-2xl border-2 border-amber-300 focus:border-amber-500 focus:outline-none text-lg font-medium bg-gradient-to-r from-amber-50 to-orange-50 focus:from-amber-100 focus:to-orange-100 transition-all duration-300 shadow-inner"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !bookTitle.trim()}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0 shadow-xl px-8 py-4 text-lg font-bold rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send ✨
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={handleContinue}
                    disabled={!canContinue || conversation.length === 0 || isLoading}
                    className={`${
                      canContinue && conversation.length > 0 && !isLoading
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-2xl hover:scale-105 animate-pulse'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    } border-0 py-4 px-6 text-base font-bold transition-all duration-300 rounded-2xl whitespace-nowrap`}
                  >
                    {canContinue && conversation.length > 0 && !isLoading ? (
                      <span className="flex items-center gap-2">
                        {t.chooseButton} ✨
                      </span>
                    ) : (
                      <span>{t.chooseButton}</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

