"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface ProgressMentorProps {
  stage: "character" | "plot" | "structure" | "writing" | "welcome"
  action?: string
  context?: Record<string, any>
  userId?: string
  position?: "bottom-left" | "bottom-right" // 位置选项
}

// 机器人图片URL - 用户提供的水彩风格女孩子图片
const MENTOR_IMAGE_URL = "/muse-avatar.png" // 图片放在public目录下

export default function ProgressMentor({ stage, action, context, userId, position: positionProp = "bottom-left" }: ProgressMentorProps) {
  const [message, setMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [showChat, setShowChat] = useState(false) // 是否显示聊天对话框
  const [chatInput, setChatInput] = useState("") // 聊天输入
  const [isHovering, setIsHovering] = useState(false) // 是否悬停在头像上
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 120 }) // 默认左下方，y值会在useEffect中设置，120px更高
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isHoveringRef = useRef(false)

  // 初始化位置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialX = positionProp === "bottom-right" 
        ? window.innerWidth - 200  // 右下方，更左边一点（从100改为200）
        : 20  // 左下方
      setPosition({ x: initialX, y: 120 }) // y是bottom值，120px，位置更高
      
      const handleResize = () => {
        // 保持当前的bottom值，但确保不超过窗口高度
        // 如果是右下角，需要重新计算x位置
        const newX = positionProp === "bottom-right"
          ? window.innerWidth - 200  // 更左边一点
          : position.x
        setPosition(prev => ({ 
          x: newX, 
          y: Math.min(prev.y || 120, window.innerHeight - 100) 
        }))
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [positionProp])

  // 发送用户行为到AI机器人
  useEffect(() => {
    if (action && stage) {
      const timer = setTimeout(() => {
        sendActionToMentor(action, stage, context || {})
      }, 500) // 延迟500ms避免频繁调用
      return () => clearTimeout(timer)
    }
  }, [action])

  // 页面进入时发送初始消息
  useEffect(() => {
    const timer = setTimeout(() => {
      sendActionToMentor(`Entered ${stage} page`, stage, context || {})
    }, 1000) // 延迟1秒确保页面加载完成
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  // 发送自定义聊天消息
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return
    
    const userMessage = chatInput.trim()
    const currentInput = userMessage // 保存用户输入
    setChatInput("")
    setShowChat(true)
    setIsHovering(true) // 确保对话框保持显示
    setIsLoading(true)
    
    // 先显示用户消息
    const userMsg = `You: ${currentInput}`
    setMessage(userMsg)
    
    try {
      // 调用API获取回复
      const response = await fetch("/api/dify-progress-mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: currentInput,
          stage: stage,
          context: context || {},
          user_id: userId || "default-user",
        }),
      })

      const data = await response.json()

      if (data.error) {
        console.error("Progress Mentor API error:", data.error)
        setMessage(`${userMsg}\n\nMuse: Sorry, I encountered an error. Please try again.`)
        setIsLoading(false)
        return
      }

      if (data.message) {
        // 显示用户消息和AI回复
        setMessage(`${userMsg}\n\nMuse: ${data.message}`)
        setShowChat(true)
        // 不自动设置isHovering，让学生选择是否交互
        
        // 清除之前的超时
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        // 3秒后自动隐藏对话框（但保留头像）
        timeoutRef.current = setTimeout(() => {
          if (!isHovering && !chatInput.trim()) {
            setShowChat(false)
            setMessage("") // 清除消息
          }
        }, 3000)
      } else {
        // 如果没有收到回复，显示提示
        setMessage(`${userMsg}\n\nMuse: I'm here to help! Feel free to ask me anything about your story.`)
        setShowChat(true)
        setIsHovering(true)
      }
    } catch (error) {
      console.error("Error sending chat message:", error)
      setMessage(`${userMsg}\n\nMuse: Sorry, I couldn't process your message. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const sendActionToMentor = async (actionText: string, currentStage: string, ctx: Record<string, any>) => {
    // 如果已经在加载中，不要重复调用
    if (isLoading) return
    
    setIsLoading(true)
    
    // 清除之前的超时
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    try {
      const response = await fetch("/api/dify-progress-mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: actionText,
          stage: currentStage,
          context: ctx,
          user_id: userId || "default-user",
        }),
      })

      const data = await response.json()

      if (data.error) {
        console.error("Progress Mentor API error:", data.error)
        setIsLoading(false)
        return
      }

      if (data.message) {
        // 如果当前消息是用户输入，先保留，然后添加AI回复
        setMessage((prevMsg) => {
          if (prevMsg && prevMsg.startsWith("You:")) {
            // 用户已经发送了消息，现在显示AI回复
            return `${prevMsg}\n\nMuse: ${data.message}`
          } else {
            // 直接显示AI消息
            return data.message
          }
        })
        setShowChat(true) // 有新消息时显示对话框
        // 不自动设置isHovering，让学生选择是否交互
        
        // 清除之前的超时
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        // 如果没有用户交互，3秒后自动隐藏对话框（但保留头像）
        timeoutRef.current = setTimeout(() => {
          if (!isHoveringRef.current && !chatInput.trim()) {
            setShowChat(false)
            setMessage("") // 清除消息
          }
        }, 3000)
      } else {
        // 如果没有收到回复，显示默认消息
        setMessage("I'm here to help! Feel free to ask me anything about your story.")
        setShowChat(true)
        setIsHovering(true)
      }
    } catch (error) {
      console.error("Error calling Progress Mentor:", error)
      setMessage("Sorry, I couldn't connect. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // 拖拽功能
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // 只处理左键
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const newX = e.clientX - dragStart.x
    const newBottom = window.innerHeight - e.clientY + dragStart.y
    
    // 限制在视口内（使用bottom定位）
    const maxX = window.innerWidth - 100 // 头像宽度约80px，留一些边距
    const minBottom = 80 // 提高最小位置，允许Muse显示在更高位置
    const maxBottom = window.innerHeight - 100
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(minBottom, Math.min(newBottom, maxBottom)),
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  return (
    <div
      ref={containerRef}
      className="fixed z-50 transition-all duration-300 pointer-events-auto"
      style={{
        left: `${position.x}px`,
        bottom: `${position.y || 120}px`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
             onMouseEnter={() => {
               setIsHovering(true)
               isHoveringRef.current = true
             }}
      onMouseLeave={(e) => {
        // 检查鼠标是否移动到对话框区域
        const relatedTarget = e.relatedTarget as HTMLElement | null
        if (!relatedTarget || (!relatedTarget.closest('.muse-chat-dialog') && !relatedTarget.closest('.muse-avatar'))) {
               // 只有当不在对话框区域且不在头像区域时，且没有消息显示时才隐藏
                 if (!showChat && !chatInput.trim()) {
                   setIsHovering(false)
                   isHoveringRef.current = false
                 }
               }
             }}
    >
      {/* 机器人头像 - 始终显示 */}
      <div className="relative">
        <div 
          className="relative w-28 h-28 flex-shrink-0 cursor-grab active:cursor-grabbing muse-avatar"
          onMouseDown={(e) => {
            // 如果点击在头像上而不是输入框区域，允许拖拽
            if (e.button === 0 && !(e.target as HTMLElement).closest('.muse-chat-dialog')) {
              setIsDragging(true)
              setDragStart({
                x: e.clientX - position.x,
                     y: e.clientY - (window.innerHeight - (position.y || 120)),
              })
            }
          }}
        >
          {/* 使用用户提供的水彩风格女孩子图片 - 移除边框，增大尺寸 */}
          <div className="relative w-full h-full rounded-full shadow-2xl overflow-hidden animate-float hover:scale-110 transition-transform">
            <Image
              src={MENTOR_IMAGE_URL}
              alt="Muse"
              fill
              className="rounded-full object-cover"
              priority
              unoptimized
            />
          </div>
          
          {/* 名称标签 */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-sm font-bold text-pink-600 bg-pink-100/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg">
              Muse
            </span>
          </div>
        </div>

        {/* 聊天对话框 - 只在有消息或hover时显示，增大尺寸 */}
        {(showChat || isHovering) && (
          <div 
            className={`muse-chat-dialog absolute bottom-32 w-96 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-2xl p-5 border-4 border-pink-200 shadow-2xl backdrop-blur-sm transform transition-all duration-300 ${
              positionProp === "bottom-right" ? "right-0" : "left-0"
            }`}
                   onMouseEnter={() => {
                     setIsHovering(true)
                     isHoveringRef.current = true
                     setShowChat(true)
                   }}
                   onMouseLeave={(e) => {
                     // 检查鼠标是否移动到头像区域或仍在对话框内
                     const relatedTarget = e.relatedTarget as HTMLElement | null
                     if (!relatedTarget || (!relatedTarget.closest('.muse-chat-dialog') && !relatedTarget.closest('.muse-avatar'))) {
                       // 如果正在输入、加载中或有消息显示，保持显示
                       if (chatInput.trim() || isLoading || showChat) {
                         return
                       }
                       setIsHovering(false)
                       isHoveringRef.current = false
                     }
                   }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-pink-600 bg-pink-100 px-3 py-1.5 rounded-full">
                    Muse
                  </span>
                </div>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-base text-gray-600 mb-3">
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    <span className="ml-2">Thinking...</span>
                  </div>
                ) : message ? (
                  <p className="text-base text-gray-700 leading-relaxed font-medium break-words mb-3" style={{ fontFamily: 'var(--font-comic-neue)' }}>
                    {message}
                  </p>
                ) : null}
                
                       {/* 输入框 - 只在hover时显示，不要自动聚焦 */}
                       {isHovering && (
                         <div className="space-y-2">
                           <input
                             type="text"
                             value={chatInput}
                             onChange={(e) => setChatInput(e.target.value)}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter' && !e.shiftKey) {
                                 e.preventDefault()
                                 sendChatMessage()
                               }
                             }}
                             onFocus={() => {
                               setIsHovering(true)
                               isHoveringRef.current = true
                               setShowChat(true)
                             }}
                             placeholder="Ask Muse for guidance..."
                             className="w-full px-4 py-2.5 text-base rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white/90"
                             style={{ fontFamily: 'var(--font-comic-neue)' }}
                           />
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || isLoading}
                      className="w-full px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isLoading ? "Sending..." : "Send"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* 关闭按钮 */}
            {showChat && !isHovering && (
              <button
                onClick={() => {
                  setShowChat(false)
                  setChatInput("")
                }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-base z-10"
                title="Hide"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

