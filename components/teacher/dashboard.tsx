"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, MessageSquare, Activity, Clock, TrendingUp, FileText, Zap, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

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

interface DashboardProps {
  onBack: () => void
}

type ArticleType = "all" | "story" | "bookReview" | "letter"

export default function Dashboard({ onBack }: DashboardProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [clearPassword, setClearPassword] = useState("")
  const [articleType, setArticleType] = useState<ArticleType>("all")

  useEffect(() => {
    fetchInteractions()
    const interval = setInterval(fetchInteractions, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [selectedUserId])

  const fetchInteractions = async () => {
    try {
      const url = selectedUserId
        ? `/api/interactions?user_id=${selectedUserId}`
        : '/api/interactions'

      const response = await fetch(url)
      const data = await response.json()
      setInteractions(data.interactions || [])
    } catch (error) {
      console.error("Error fetching interactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter by article type
  const filteredByArticleType = useMemo(() => {
    if (articleType === "all") {
      return interactions
    } else if (articleType === "story") {
      return interactions.filter(i => i.story || i.stage === "review" || i.stage === "writing" || i.stage === "character" || i.stage === "plot" || i.stage === "structure")
    } else if (articleType === "bookReview") {
      return interactions.filter(i => i.review || i.stage === "bookReviewComplete" || i.stage === "bookReviewWriting" || i.stage === "bookSelection" || i.stage === "bookReviewTypeSelection")
    } else if (articleType === "letter") {
      return interactions.filter(i => i.stage === "letterComplete" || i.stage === "letterGame" || i.stage === "letterPuzzle" || i.stage === "letterAdventure" || i.letter)
    }
    return interactions
  }, [interactions, articleType])

  // 将所有学生合并为"halk"一个学生，并且只显示当前文章类型下的学生
  const uniqueUsers = useMemo(() => {
    const users = Array.from(new Set(filteredByArticleType.map(i => i.user_id)))
    // 如果有任何学生，统一显示为"halk"
    return users.length > 0 ? ["halk"] : []
  }, [filteredByArticleType])

  const filteredInteractions = selectedUserId
    ? filteredByArticleType.filter(i => i.user_id === selectedUserId)
    : filteredByArticleType

  // 分组功能：将所有学生合并为"halk"一个学生
  const groupedInteractions = useMemo(() => {
    const groups: Record<string, Interaction[]> = {}
    // 将所有interactions都归到"halk"名下
    filteredInteractions.forEach(interaction => {
      if (!groups["halk"]) {
        groups["halk"] = []
      }
      groups["halk"].push(interaction)
    })
    // 按时间排序每个组内的交互
    Object.keys(groups).forEach(userId => {
      groups[userId].sort((a, b) => b.timestamp - a.timestamp)
    })
    return groups
  }, [filteredInteractions])

  // 切换用户展开/折叠
  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  // Statistics - 只统计有AI的学生（排除无AI用户如Rogers）
  const stats = useMemo(() => {
    // 识别有AI的用户（有API调用的用户）
    const usersWithAi = new Set<string>()
    
    interactions.forEach(i => {
      if (i.api_calls && i.api_calls.length > 0) {
        usersWithAi.add(i.user_id)
      }
    })
    
    // 排除无AI用户（如Rogers）
    usersWithAi.delete('Rogers')
    
    // 只统计有AI的学生的交互
    const aiInteractions = filteredInteractions.filter(i => {
      // 排除Rogers等明确的无AI用户
      if (i.user_id === 'Rogers') {
        return false
      }
      // 只统计有API调用的交互，或者用户在有AI用户列表中
      return usersWithAi.has(i.user_id) || (i.api_calls && i.api_calls.length > 0)
    })
    
    // 只统计有AI的用户
    const aiUsers = Array.from(usersWithAi)
    
    const totalApiCalls = aiInteractions.reduce((sum, i) => sum + (i.api_calls?.length || 0), 0)
    const stageCounts = aiInteractions.reduce((acc, i) => {
      acc[i.stage] = (acc[i.stage] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const recentActivity = aiInteractions.filter(i => {
      const hoursAgo = (Date.now() - i.timestamp) / (1000 * 60 * 60)
      return hoursAgo < 24
    }).length

    return {
      totalInteractions: aiInteractions.length,
      totalUsers: aiUsers.length,
      totalApiCalls,
      recentActivity,
      stageCounts,
    }
  }, [filteredInteractions, interactions])

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      character: "from-purple-500 to-pink-500",
      plot: "from-blue-500 to-cyan-500",
      structure: "from-indigo-500 to-purple-500",
      writing: "from-orange-500 to-red-500",
      review: "from-green-500 to-emerald-500",
    }
    return colors[stage] || "from-gray-500 to-gray-600"
  }

  const handleClearData = async () => {
    if (clearPassword !== 'yinyin2948') {
      toast.error("Incorrect password")
      return
    }

    try {
      const response = await fetch('/api/interactions?password=yinyin2948', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success("All data cleared successfully")
        setInteractions([])
        setShowClearDialog(false)
        setClearPassword("")
      } else {
        toast.error(data.error || "Failed to clear data")
      }
    } catch (error) {
      console.error("Error clearing data:", error)
      toast.error("Failed to clear data")
    }
  }

  return (
    <div className="min-h-screen py-6 px-4 pb-16 bg-gradient-to-br from-indigo-100 via-purple-50 via-blue-50 to-cyan-50" style={{ paddingTop: '100px' }}>
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src="/nicole指.png"
                alt="Nicole"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 font-medium">Monitor student-AI interactions and activity</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowClearDialog(true)}
              variant="outline"
              className="bg-red-50 border-2 border-red-300 hover:bg-red-100 text-red-700 shadow-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Data
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              className="bg-white/80 backdrop-blur-lg border-2 border-purple-200 hover:bg-purple-50 shadow-lg"
            >
              ← Back
            </Button>
          </div>
        </div>

        {/* Article Type Filter */}
        <div className="mb-6 bg-white/80 backdrop-blur-lg rounded-2xl p-4 border-2 border-purple-200 shadow-xl">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-gray-700">Article Type:</span>
            <div className="flex gap-2">
              <Button
                onClick={() => setArticleType("all")}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  articleType === "all"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </Button>
              <Button
                onClick={() => setArticleType("story")}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  articleType === "story"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Story
              </Button>
              <Button
                onClick={() => setArticleType("bookReview")}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  articleType === "bookReview"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Book Review
              </Button>
              <Button
                onClick={() => setArticleType("letter")}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  articleType === "letter"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Letter
              </Button>
            </div>
          </div>
        </div>

        {/* Clear Data Dialog */}
        {showClearDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Clear All Data</h2>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-1">
                  <p className="text-gray-600 mb-2">Please enter teacher password to confirm:</p>
                  <p className="text-orange-600 font-semibold text-sm">⚠️ Are you sure? This action cannot be undone!</p>
                </div>
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src="/nicolethinking.png"
                    alt="Nicole thinking"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
              <Input
                type="password"
                placeholder="Enter password"
                value={clearPassword}
                onChange={(e) => setClearPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleClearData()
                }}
                className="mb-6"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleClearData}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirm Clear
                </Button>
                <Button
                  onClick={() => {
                    setShowClearDialog(false)
                    setClearPassword("")
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-2xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <MessageSquare className="h-10 w-10" />
              <span className="text-4xl font-extrabold">{stats.totalInteractions}</span>
            </div>
            <p className="text-purple-100 font-semibold text-lg">Total Interactions</p>
            <p className="text-purple-200 text-sm mt-2">All student-AI conversations</p>
          </div>

          <div className="bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-500 rounded-2xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <Users className="h-10 w-10" />
              <span className="text-4xl font-extrabold">{stats.totalUsers}</span>
            </div>
            <p className="text-blue-100 font-semibold text-lg">Active Students</p>
            <p className="text-blue-200 text-sm mt-2">Students using the platform</p>
          </div>

          <div className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <Zap className="h-10 w-10" />
              <span className="text-4xl font-extrabold">{stats.totalApiCalls}</span>
            </div>
            <p className="text-orange-100 font-semibold text-lg">API Calls</p>
            <p className="text-orange-200 text-sm mt-2">Dify & Poe API requests</p>
          </div>

          <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-2xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <Activity className="h-10 w-10" />
              <span className="text-4xl font-extrabold">{stats.recentActivity}</span>
            </div>
            <p className="text-green-100 font-semibold text-lg">Last 24 Hours</p>
            <p className="text-green-200 text-sm mt-2">Recent activity count</p>
          </div>
        </div>

        {/* Stage Distribution */}
        {Object.keys(stats.stageCounts).length > 0 && (
          <div className="mb-8 bg-gradient-to-br from-white to-purple-50 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-300 shadow-2xl">
            <h2 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              Activity by Stage
            </h2>
            <p className="text-gray-600 mb-6 font-medium">Distribution of student interactions across different story creation stages</p>
            <div className="flex flex-wrap gap-4">
              {Object.entries(stats.stageCounts).map(([stage, count]) => (
                <div
                  key={stage}
                  className={`bg-gradient-to-br ${getStageColor(stage)} rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform flex-1 min-w-[150px]`}
                >
                  <div className="text-4xl font-extrabold mb-2">{count}</div>
                  <div className="text-base font-bold capitalize">{stage}</div>
                  <div className="text-xs opacity-90 mt-1">
                    {Math.round((count / stats.totalInteractions) * 100)}% of total
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Statistics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200 shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-indigo-700">Average Interactions per Student</h3>
            <div className="text-5xl font-extrabold text-indigo-600 mb-2">
              {stats.totalUsers > 0 ? Math.round(stats.totalInteractions / stats.totalUsers) : 0}
            </div>
            <p className="text-gray-600 font-medium">Interactions per student account</p>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-2xl p-8 border-2 border-pink-200 shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-pink-700">Average API Calls per Interaction</h3>
            <div className="text-5xl font-extrabold text-pink-600 mb-2">
              {stats.totalInteractions > 0 ? (stats.totalApiCalls / stats.totalInteractions).toFixed(1) : 0}
            </div>
            <p className="text-gray-600 font-medium">API efficiency metric</p>
          </div>
        </div>

        {/* Students List - Collapsible */}
        <div className="mb-6 bg-gradient-to-br from-white to-blue-50 backdrop-blur-lg rounded-2xl p-8 border-2 border-blue-300 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <label className="block text-2xl font-extrabold mb-2 text-gray-800">Students</label>
              <p className="text-gray-600 font-medium">Click on a student to view their interactions grouped by stage.</p>
            </div>
            <div className="bg-blue-100 rounded-xl px-4 py-2 border-2 border-blue-200">
              <span className="text-blue-700 font-bold text-lg">{uniqueUsers.length} Students</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {uniqueUsers.map(userId => {
              const userInteractions = groupedInteractions[userId] || []
              const hasAi = userInteractions.some(i => i.api_calls && i.api_calls.length > 0)
              const isNoAi = userId === 'Rogers' || !hasAi
              
              // 对于无AI版本，只统计review阶段的story，避免重复计算writing阶段
              const storyInteractions = isNoAi 
                ? userInteractions.filter(i => i.stage === 'review' && i.story)
                : userInteractions.filter(i => i.story)
              
              // 统计book review
              const reviewInteractions = userInteractions.filter(i => i.review || i.stage === 'bookReviewComplete')
              
              // 统计letter
              const letterInteractions = userInteractions.filter(i => 
                i.letter || 
                i.output?.letter || 
                (i.output && typeof i.output === 'object' && 'letter' in i.output) ||
                i.stage === 'letterComplete'
              )
              
              const hasStory = storyInteractions.length > 0
              const storyCount = storyInteractions.length
              const hasReview = reviewInteractions.length > 0
              const reviewCount = reviewInteractions.length
              const hasLetter = letterInteractions.length > 0
              const letterCount = letterInteractions.length
              
              // 收集所有完整文章（按类型分组）
              const completeArticles = {
                stories: storyInteractions.map(i => ({
                  ...i,
                  articleType: 'Story' as const,
                  content: i.story || i.output?.story || '',
                })),
                reviews: reviewInteractions.map(i => ({
                  ...i,
                  articleType: 'Book Review' as const,
                  content: i.review || '',
                })),
                letters: letterInteractions.map(i => {
                  const letterContent = i.letter || i.output?.letter || 
                    (i.output && typeof i.output === 'object' && 'letter' in i.output 
                      ? (typeof i.output.letter === 'string' ? i.output.letter : '') 
                      : '')
                  return {
                    ...i,
                    articleType: 'Letter' as const,
                    content: letterContent,
                  }
                }),
              }
              
              const isExpanded = expandedUsers.has(userId)
              
              // 按阶段分组
              // 对于无AI版本，过滤掉writing阶段的记录（避免与review重复）
              // 对于plot阶段，去重：只保留最新的记录（相同消息内容的记录）
              const interactionsByStage = userInteractions.reduce((acc, interaction) => {
                // 如果是无AI版本且是writing阶段，且有story字段，则跳过（避免重复）
                if (isNoAi && interaction.stage === 'writing' && interaction.story) {
                  return acc
                }
                
                // 对于 story：只保留 review 阶段的最终版本，跳过 writing 阶段的中间版本
                if (interaction.stage === 'writing' && interaction.story) {
                  // 检查是否有 review 阶段有相同的 story
                  const hasReviewVersion = userInteractions.some(
                    i => i.stage === 'review' && i.story && i.story === interaction.story
                  )
                  if (hasReviewVersion) {
                    return acc // 如果有最终版本，跳过中间版本
                  }
                }
                
                // 对于 book review：只保留 bookReviewComplete 阶段的最终版本
                if (interaction.stage === 'bookReviewWriting' && interaction.review) {
                  const hasCompleteVersion = userInteractions.some(
                    i => i.stage === 'bookReviewComplete' && i.review && i.review === interaction.review
                  )
                  if (hasCompleteVersion) {
                    return acc
                  }
                }
                
                // 对于 letter：只保留 letterComplete 阶段的最终版本
                if (interaction.stage === 'letterGame' && interaction.letter) {
                  const hasCompleteVersion = userInteractions.some(
                    i => i.stage === 'letterComplete' && i.letter && i.letter === interaction.letter
                  )
                  if (hasCompleteVersion) {
                    return acc
                  }
                }
                
                // 对于plot阶段，检查是否已经有相同消息的记录
                if (interaction.stage === 'plot' && interaction.input?.messages) {
                  const existingPlot = acc['plot']?.find(existing => {
                    const existingMessages = existing.input?.messages
                    const newMessages = interaction.input?.messages
                    if (!existingMessages || !newMessages) return false
                    
                    // 比较消息数量，如果新消息数量小于或等于现有消息，可能是重复的旧记录
                    if (newMessages.length <= existingMessages.length) {
                      // 检查是否是相同的前缀（旧记录）
                      return JSON.stringify(newMessages) === JSON.stringify(existingMessages.slice(0, newMessages.length))
                    }
                    // 如果新消息数量更多，可能是更新的记录
                    return false
                  })
                  
                  if (existingPlot) {
                    // 如果新记录的消息数量更多，替换旧记录
                    if (interaction.input.messages.length > (existingPlot.input?.messages?.length || 0)) {
                      acc['plot'] = acc['plot']?.filter(i => i !== existingPlot) || []
                      if (!acc['plot']) acc['plot'] = []
                      acc['plot'].push(interaction)
                    }
                    // 否则跳过这个记录（它是旧记录的重复）
                    return acc
                  }
                }
                
                if (!acc[interaction.stage]) {
                  acc[interaction.stage] = []
                }
                acc[interaction.stage].push(interaction)
                return acc
              }, {} as Record<string, Interaction[]>)
              
              // 对每个阶段的记录按时间排序，并去重plot阶段的重复记录
              Object.keys(interactionsByStage).forEach(stage => {
                if (stage === 'plot') {
                  // 对于plot阶段，按时间排序
                  interactionsByStage[stage].sort((a, b) => b.timestamp - a.timestamp)
                  
                  // 去重：对于相同用户，只保留消息数量最多的记录（最新的完整对话）
                  const uniquePlotInteractions: Interaction[] = []
                  const userLatestPlot = new Map<string, Interaction>()
                  
                  interactionsByStage[stage].forEach(interaction => {
                    const messages = interaction.input?.messages
                    const existing = userLatestPlot.get(interaction.user_id)
                    
                    if (!existing) {
                      userLatestPlot.set(interaction.user_id, interaction)
                      uniquePlotInteractions.push(interaction)
                    } else {
                      // 如果新记录的消息数量更多，替换旧记录
                      const existingMessages = existing.input?.messages
                      if (messages && Array.isArray(messages) && 
                          (!existingMessages || messages.length > existingMessages.length)) {
                        const index = uniquePlotInteractions.indexOf(existing)
                        if (index >= 0) {
                          uniquePlotInteractions[index] = interaction
                        }
                        userLatestPlot.set(interaction.user_id, interaction)
                      }
                    }
                  })
                  
                  interactionsByStage[stage] = uniquePlotInteractions
                } else {
                  // 其他阶段按时间排序
                  interactionsByStage[stage].sort((a, b) => b.timestamp - a.timestamp)
                }
              })
              
              const stages = Object.keys(interactionsByStage)
              
              return (
                <div key={userId} className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden">
                  {/* Student Header - Clickable */}
                  <button
                    onClick={() => toggleUserExpanded(userId)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{isExpanded ? "▼" : "▶"}</span>
                      <span className="text-xl font-bold text-gray-800">👤 {userId}</span>
                      {isNoAi ? (
                        <span className="bg-gray-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          No AI
                        </span>
                      ) : (
                        <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          With AI
                        </span>
                      )}
                      {hasStory && (
                        <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          {storyCount} story{storyCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {hasReview && (
                        <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          {reviewCount} review{reviewCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {hasLetter && (
                        <span className="bg-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          {letterCount} letter{letterCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {/* 显示文章类型标签 */}
                      {(hasStory || hasReview || hasLetter) && (
                        <span className="text-xs text-gray-600 font-semibold">
                          Types: {[
                            hasStory && 'Story',
                            hasReview && 'Book Review',
                            hasLetter && 'Letter'
                          ].filter(Boolean).join(', ')}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {userInteractions.length} interaction{userInteractions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {stages.map(stage => (
                        <span
                          key={stage}
                          className={`px-2 py-1 rounded text-xs font-semibold bg-gradient-to-r ${getStageColor(stage)} text-white shadow-sm`}
                        >
                          {stage} ({interactionsByStage[stage].length})
                        </span>
                      ))}
                    </div>
                  </button>
                  
                  {/* Expanded Content - Complete Articles First, Then Stages */}
                  {isExpanded && (
                    <div className="border-t-2 border-blue-100 bg-blue-50/50 p-6 space-y-6">
                      {/* 完整文章部分 - 放在最前面 */}
                      {(completeArticles.stories.length > 0 || completeArticles.reviews.length > 0 || completeArticles.letters.length > 0) && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-4 border-purple-300 shadow-xl mb-6">
                          <h2 className="text-2xl font-bold text-purple-700 mb-6 flex items-center gap-2">
                            <FileText className="h-6 w-6" /> Complete Articles by {userId}
                          </h2>
                          
                          <div className="space-y-6">
                            {/* Stories */}
                            {completeArticles.stories.map((article, idx) => (
                              <div key={`story-${idx}`} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-3 border-green-300 shadow-lg">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                  <h4 className="font-bold text-lg text-green-700 flex items-center gap-2">
                                    <FileText className="h-5 w-5" /> {article.articleType} #{idx + 1}
                                  </h4>
                                  <div className="flex gap-2 flex-wrap items-center">
                                    <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                      Article Type: {article.articleType}
                                    </span>
                                    <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full font-semibold">
                                      {formatTime(article.timestamp)}
                                    </span>
                                  </div>
                                </div>
                                <div className="bg-white/90 p-6 rounded-lg border-2 border-green-200 shadow-inner">
                                  <pre className="text-base whitespace-pre-wrap text-gray-800 font-serif leading-relaxed break-words">
                                    {typeof article.content === 'string' ? article.content : JSON.stringify(article.content, null, 2)}
                                  </pre>
                                </div>
                                {typeof article.content === 'string' && article.content && (
                                  <div className="mt-4 flex items-center gap-4 text-sm text-green-600">
                                    <span>📊 Length: {article.content.length} characters</span>
                                    <span>📝 Words: ~{Math.ceil(article.content.split(/\s+/).filter(w => w.length > 0).length)} words</span>
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {/* Book Reviews */}
                            {completeArticles.reviews.map((article, idx) => (
                              <div key={`review-${idx}`} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-3 border-blue-300 shadow-lg">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                  <h4 className="font-bold text-lg text-blue-700 flex items-center gap-2">
                                    <FileText className="h-5 w-5" /> {article.articleType} #{idx + 1}
                                  </h4>
                                  <div className="flex gap-2 flex-wrap items-center">
                                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                      Article Type: {article.articleType}
                                    </span>
                                    {article.reviewType && (
                                      <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-semibold capitalize">
                                        {article.reviewType}
                                      </span>
                                    )}
                                    {article.bookTitle && (
                                      <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-semibold italic">
                                        {article.bookTitle}
                                      </span>
                                    )}
                                    <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-semibold">
                                      {formatTime(article.timestamp)}
                                    </span>
                                  </div>
                                </div>
                                {article.bookCoverUrl && (
                                  <div className="mb-4 relative w-32 h-48 mx-auto rounded-lg overflow-hidden border-2 border-blue-300 shadow-lg">
                                    <Image
                                      src={article.bookCoverUrl}
                                      alt={`Cover of ${article.bookTitle || 'book'}`}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                )}
                                <div className="bg-white/90 p-6 rounded-lg border-2 border-blue-200 shadow-inner">
                                  <pre className="text-base whitespace-pre-wrap text-gray-800 font-serif leading-relaxed break-words">
                                    {article.content}
                                  </pre>
                                </div>
                                {article.content && (
                                  <div className="mt-4 flex items-center gap-4 text-sm text-blue-600">
                                    <span>📊 Length: {article.content.length} characters</span>
                                    <span>📝 Words: ~{Math.ceil(article.content.split(/\s+/).filter(w => w.length > 0).length)} words</span>
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {/* Letters */}
                            {completeArticles.letters.map((article, idx) => (
                              <div key={`letter-${idx}`} className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border-3 border-pink-300 shadow-lg">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                  <h4 className="font-bold text-lg text-pink-700 flex items-center gap-2">
                                    <FileText className="h-5 w-5" /> {article.articleType} #{idx + 1}
                                  </h4>
                                  <div className="flex gap-2 flex-wrap items-center">
                                    <span className="bg-pink-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                      Article Type: {article.articleType}
                                    </span>
                                    {(article.recipient || article.input?.recipient) && (
                                      <span className="text-xs text-pink-600 bg-pink-100 px-3 py-1 rounded-full font-semibold">
                                        To: {article.recipient || article.input?.recipient}
                                      </span>
                                    )}
                                    {(article.occasion || article.input?.occasion) && (
                                      <span className="text-xs text-pink-600 bg-pink-100 px-3 py-1 rounded-full font-semibold">
                                        {article.occasion || article.input?.occasion}
                                      </span>
                                    )}
                                    <span className="text-xs text-pink-600 bg-pink-100 px-3 py-1 rounded-full font-semibold">
                                      {formatTime(article.timestamp)}
                                    </span>
                                  </div>
                                </div>
                                <div className="bg-white/90 p-6 rounded-lg border-2 border-pink-200 shadow-inner">
                                  <pre className="text-base whitespace-pre-wrap text-gray-800 font-serif leading-relaxed break-words">
                                    {article.content}
                                  </pre>
                                </div>
                                {article.content && (
                                  <div className="mt-4 flex items-center gap-4 text-sm text-pink-600">
                                    <span>📊 Length: {article.content.length} characters</span>
                                    <span>📝 Words: ~{Math.ceil(article.content.split(/\s+/).filter(w => w.length > 0).length)} words</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 其他阶段交互记录 */}
                      {stages.map(stage => (
                        <div key={stage} className="bg-white rounded-lg border-2 border-gray-200 p-4">
                          <h3 className={`text-lg font-bold mb-4 text-white px-4 py-2 rounded-lg inline-block bg-gradient-to-r ${getStageColor(stage)} shadow-lg`}>
                            {stage.toUpperCase()} ({interactionsByStage[stage].length})
                          </h3>
                          
                          <div className="space-y-4 mt-4">
                            {interactionsByStage[stage].map((interaction, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-semibold text-gray-600">
                                    {formatTime(interaction.timestamp)}
                                  </span>
                                  {interaction.story && (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                                      Has Story
                                    </span>
                                  )}
                                </div>
                                
                                {/* Story Display - 完整显示 */}
                                {interaction.story && (
                                  <div className="mb-3 bg-green-50 rounded-lg p-4 border border-green-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-bold text-base text-green-700">📖 Complete Story</h4>
                                      <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                        Article Type: Story
                                      </span>
                                    </div>
                                    <pre className="text-sm whitespace-pre-wrap text-gray-800 max-h-96 overflow-y-auto bg-white p-4 rounded border border-green-200 leading-relaxed">
                                      {interaction.story}
                                    </pre>
                                    <div className="mt-3 text-xs text-green-600">
                                      {interaction.story.length} characters, ~{Math.ceil(interaction.story.split(/\s+/).filter(w => w.length > 0).length)} words
                                    </div>
                                  </div>
                                )}
                                
                                {/* 如果没有story字段，尝试从output中获取 */}
                                {!interaction.story && interaction.output?.story && (
                                  <div className="mb-3 bg-green-50 rounded-lg p-4 border border-green-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-bold text-base text-green-700">📖 Complete Story (from output)</h4>
                                      <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                        Article Type: Story
                                      </span>
                                    </div>
                                    <pre className="text-sm whitespace-pre-wrap text-gray-800 max-h-96 overflow-y-auto bg-white p-4 rounded border border-green-200 leading-relaxed">
                                      {typeof interaction.output.story === 'string' ? interaction.output.story : JSON.stringify(interaction.output.story, null, 2)}
                                    </pre>
                                    <div className="mt-3 text-xs text-green-600">
                                      {typeof interaction.output.story === 'string' ? `${interaction.output.story.length} characters, ~${Math.ceil(interaction.output.story.split(/\s+/).filter((w: string) => w.length > 0).length)} words` : 'N/A'}
                                    </div>
                                  </div>
                                )}

                                {/* Book Review Display - 完整显示 */}
                                {interaction.review && (
                                  <div className="mb-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                      <h4 className="font-bold text-base text-blue-700">📚 Complete Book Review</h4>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                          Article Type: Book Review
                                        </span>
                                        {interaction.reviewType && (
                                          <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold capitalize">
                                            {interaction.reviewType}
                                          </span>
                                        )}
                                        {interaction.bookTitle && (
                                          <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold italic">
                                            {interaction.bookTitle}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {interaction.bookCoverUrl && (
                                      <div className="mb-3 relative w-32 h-48 mx-auto rounded-lg overflow-hidden border-2 border-blue-300 shadow-lg">
                                        <Image
                                          src={interaction.bookCoverUrl}
                                          alt={`Cover of ${interaction.bookTitle || 'book'}`}
                                          fill
                                          className="object-cover"
                                          unoptimized
                                        />
                                      </div>
                                    )}
                                    <pre className="text-sm whitespace-pre-wrap text-gray-800 max-h-96 overflow-y-auto bg-white p-4 rounded border border-blue-200 leading-relaxed">
                                      {interaction.review}
                                    </pre>
                                    <div className="mt-3 text-xs text-blue-600">
                                      {interaction.review.length} characters, ~{Math.ceil(interaction.review.split(/\s+/).filter(w => w.length > 0).length)} words
                                    </div>
                                  </div>
                                )}
                                
                                {/* AI Conversation - 完整显示 */}
                                {interaction.input?.messages && Array.isArray(interaction.input.messages) && interaction.input.messages.length > 0 && (
                                  <div className="mb-3 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                    <h4 className="font-bold text-sm text-indigo-700 mb-3">💬 AI Conversation ({interaction.input.messages.length} messages)</h4>
                                    <div className="space-y-3 max-h-96 overflow-y-auto bg-white rounded-lg p-4 border border-indigo-100">
                                      {interaction.input.messages.map((msg: any, msgIdx: number) => (
                                        <div key={msgIdx} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'}`}>
                                          <div className="font-semibold text-sm mb-2 text-indigo-700">
                                            {msg.role === 'user' ? '👤 Student' : '🤖 AI'}:
                                          </div>
                                          <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                                            {msg.content || JSON.stringify(msg)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* API Calls - 默认隐藏，点击展开 */}
                                {interaction.api_calls && interaction.api_calls.length > 0 && (
                                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                    <details className="group">
                                      <summary className="cursor-pointer font-bold text-sm text-orange-700 mb-2 flex items-center gap-2 hover:text-orange-800">
                                        <Zap className="h-4 w-4" />
                                        <span>⚡ API Calls ({interaction.api_calls.length}) - Click to View</span>
                                        <span className="text-xs text-orange-600 group-open:hidden">▼</span>
                                        <span className="text-xs text-orange-600 hidden group-open:inline">▲</span>
                                      </summary>
                                      <div className="mt-3 space-y-3">
                                        {interaction.api_calls.map((apiCall, apiIdx) => (
                                          <div key={apiIdx} className="bg-white rounded-lg p-3 border border-orange-200">
                                            <div className="font-bold text-xs mb-2 text-orange-600">
                                              {apiCall.endpoint}
                                            </div>
                                            <details className="text-xs">
                                              <summary className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium mb-2">
                                                View Request/Response
                                              </summary>
                                              <div className="mt-2 space-y-2">
                                                <div>
                                                  <strong className="text-gray-700">Request:</strong>
                                                  <pre className="bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32 border border-gray-200 text-xs">
                                                    {JSON.stringify(apiCall.request, null, 2)}
                                                  </pre>
                                                </div>
                                                <div>
                                                  <strong className="text-gray-700">Response:</strong>
                                                  <pre className="bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32 border border-gray-200 text-xs">
                                                    {JSON.stringify(apiCall.response, null, 2)}
                                                  </pre>
                                                </div>
                                              </div>
                                            </details>
                                          </div>
                                        ))}
                                      </div>
                                    </details>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Old Interactions List - Hidden when using new collapsible design */}
        {selectedUserId && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500 text-lg">Loading...</div>
            ) : filteredInteractions.length === 0 ? (
              <div className="text-center py-12 bg-white/80 backdrop-blur-lg rounded-2xl border-2 border-gray-200">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No interactions yet</p>
              </div>
            ) : null}
          </div>
        )}
        
        {selectedUserId && filteredInteractions.length > 0 && (
          <div className="space-y-4">
            {filteredInteractions.map((interaction, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`bg-gradient-to-r ${getStageColor(interaction.stage)} text-white px-4 py-2 rounded-xl font-bold text-sm`}>
                      {interaction.stage.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-gray-800">Student: </span>
                      <span className="text-purple-600 font-semibold">{interaction.user_id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="h-4 w-4" />
                    {formatTime(interaction.timestamp)}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                    <h4 className="font-bold mb-2 text-sm text-purple-700 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Input
                    </h4>
                    <pre className="bg-white/80 p-3 rounded-lg text-xs overflow-auto max-h-32 border border-purple-100">
                      {JSON.stringify(interaction.input, null, 2)}
                    </pre>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                    <h4 className="font-bold mb-2 text-sm text-blue-700 flex items-center gap-2">
                      <Activity className="h-4 w-4" /> Output
                    </h4>
                    <pre className="bg-white/80 p-3 rounded-lg text-xs overflow-auto max-h-32 border border-blue-100">
                      {JSON.stringify(interaction.output, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* 显示学生完整写作内容 - 完整显示 */}
                {interaction.story && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-3 border-green-300 mb-4 shadow-lg">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <h4 className="font-bold text-lg text-green-700 flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Complete Story by {interaction.user_id}
                      </h4>
                      <div className="flex gap-2 flex-wrap items-center">
                        <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          Article Type: Story
                        </span>
                        <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full font-semibold">
                          {interaction.stage === 'review' ? 'Final Story' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/90 p-6 rounded-lg border-2 border-green-200 shadow-inner">
                      <pre className="text-base whitespace-pre-wrap text-gray-800 font-serif leading-relaxed break-words">
                        {interaction.story}
                      </pre>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-green-600">
                      <span>📊 Story Length: {interaction.story.length} characters</span>
                      <span>📝 Words: ~{Math.ceil(interaction.story.split(/\s+/).filter(w => w.length > 0).length)} words</span>
                    </div>
                  </div>
                )}
                
                {/* 如果没有story字段，尝试从output中获取 */}
                {!interaction.story && interaction.output?.story && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-3 border-green-300 mb-4 shadow-lg">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <h4 className="font-bold text-lg text-green-700 flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Complete Story by {interaction.user_id} (No AI Version)
                      </h4>
                      <div className="flex gap-2 flex-wrap items-center">
                        <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          Article Type: Story
                        </span>
                        <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full font-semibold">
                          {interaction.stage === 'review' ? 'Final Story' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/90 p-6 rounded-lg border-2 border-green-200 shadow-inner">
                      <pre className="text-base whitespace-pre-wrap text-gray-800 font-serif leading-relaxed break-words">
                        {typeof interaction.output.story === 'string' ? interaction.output.story : JSON.stringify(interaction.output.story, null, 2)}
                      </pre>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-green-600">
                      {typeof interaction.output.story === 'string' && (
                        <>
                          <span>📊 Story Length: {interaction.output.story.length} characters</span>
                          <span>📝 Words: ~{Math.ceil(interaction.output.story.split(/\s+/).filter((w: string) => w.length > 0).length)} words</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Book Review Display - 完整显示 */}
                {interaction.review && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-3 border-blue-300 mb-4 shadow-lg">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <h4 className="font-bold text-lg text-blue-700 flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Complete Book Review by {interaction.user_id}
                      </h4>
                      <div className="flex gap-2 flex-wrap items-center">
                        <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          Article Type: Book Review
                        </span>
                        {interaction.reviewType && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-semibold capitalize">
                            {interaction.reviewType}
                          </span>
                        )}
                        {interaction.bookTitle && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-semibold italic">
                            {interaction.bookTitle}
                          </span>
                        )}
                      </div>
                    </div>
                    {interaction.bookCoverUrl && (
                      <div className="mb-4 relative w-32 h-48 mx-auto rounded-lg overflow-hidden border-2 border-blue-300 shadow-lg">
                        <Image
                          src={interaction.bookCoverUrl}
                          alt={`Cover of ${interaction.bookTitle || 'book'}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="bg-white/90 p-6 rounded-lg border-2 border-blue-200 shadow-inner">
                      <pre className="text-base whitespace-pre-wrap text-gray-800 font-serif leading-relaxed break-words">
                        {interaction.review}
                      </pre>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-blue-600">
                      <span>📊 Review Length: {interaction.review.length} characters</span>
                      <span>📝 Words: ~{Math.ceil(interaction.review.split(/\s+/).filter(w => w.length > 0).length)} words</span>
                    </div>
                  </div>
                )}

                {/* Letter Display - 完整显示 */}
                {(interaction.letter || interaction.output?.letter || (interaction.output && typeof interaction.output === 'object' && 'letter' in interaction.output)) && (
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border-3 border-pink-300 mb-4 shadow-lg">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <h4 className="font-bold text-lg text-pink-700 flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Complete Letter by {interaction.user_id}
                      </h4>
                      <div className="flex gap-2 flex-wrap items-center">
                        <span className="bg-pink-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          Article Type: Letter
                        </span>
                        {(interaction.recipient || interaction.input?.recipient) && (
                          <span className="text-xs text-pink-600 bg-pink-100 px-3 py-1 rounded-full font-semibold">
                            To: {interaction.recipient || interaction.input?.recipient}
                          </span>
                        )}
                        {(interaction.occasion || interaction.input?.occasion) && (
                          <span className="text-xs text-pink-600 bg-pink-100 px-3 py-1 rounded-full font-semibold">
                            {interaction.occasion || interaction.input?.occasion}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-white/90 p-6 rounded-lg border-2 border-pink-200 shadow-inner">
                      <pre className="text-base whitespace-pre-wrap text-gray-800 font-serif leading-relaxed break-words">
                        {interaction.letter || interaction.output?.letter || (interaction.output && typeof interaction.output === 'object' && 'letter' in interaction.output ? (typeof interaction.output.letter === 'string' ? interaction.output.letter : JSON.stringify(interaction.output.letter, null, 2)) : '')}
                      </pre>
                    </div>
                    {(() => {
                      const letterContent = interaction.letter || interaction.output?.letter || (interaction.output && typeof interaction.output === 'object' && 'letter' in interaction.output ? (typeof interaction.output.letter === 'string' ? interaction.output.letter : '') : '')
                      return letterContent && (
                        <div className="mt-4 flex items-center gap-4 text-sm text-pink-600">
                          <span>📊 Letter Length: {letterContent.length} characters</span>
                          <span>📝 Words: ~{Math.ceil(letterContent.split(/\s+/).filter(w => w.length > 0).length)} words</span>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* 显示AI对话内容 - 完整显示 */}
                {interaction.input && typeof interaction.input === 'object' && interaction.input.messages && Array.isArray(interaction.input.messages) && interaction.input.messages.length > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200 mb-4">
                    <h4 className="font-bold mb-4 text-base text-indigo-700 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" /> AI Conversation ({interaction.input.messages.length} messages)
                    </h4>
                    <div className="bg-white/90 p-4 rounded-lg border border-indigo-200 max-h-[500px] overflow-y-auto space-y-3">
                      {interaction.input.messages.map((msg: any, idx: number) => (
                        <div key={idx} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'}`}>
                          <div className="font-semibold mb-2 text-sm text-indigo-700">
                            {msg.role === 'user' ? '👤 Student' : '🤖 AI'}:
                          </div>
                          <div className="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content || JSON.stringify(msg)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* API Calls - 默认隐藏，点击展开 */}
                {interaction.api_calls && interaction.api_calls.length > 0 && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
                    <details className="group">
                      <summary className="cursor-pointer font-bold text-sm text-orange-700 mb-3 flex items-center gap-2 hover:text-orange-800">
                        <Zap className="h-5 w-5" />
                        <span>⚡ API Calls ({interaction.api_calls.length}) - Click to View</span>
                        <span className="text-xs text-orange-600 group-open:hidden ml-auto">▼</span>
                        <span className="text-xs text-orange-600 hidden group-open:inline ml-auto">▲</span>
                      </summary>
                      <div className="mt-4 space-y-3">
                        {interaction.api_calls.map((apiCall, apiIndex) => (
                          <div key={apiIndex} className="bg-white/90 p-4 rounded-lg border border-orange-200">
                            <div className="font-bold text-sm mb-2 text-orange-600">
                              {apiCall.endpoint}
                            </div>
                            <details className="text-xs">
                              <summary className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium mb-2">
                                View Request/Response
                              </summary>
                              <div className="mt-3 space-y-3">
                                <div>
                                  <strong className="text-gray-700">Request:</strong>
                                  <pre className="bg-gray-50 p-3 rounded mt-1 overflow-auto max-h-32 border border-gray-200">
                                    {JSON.stringify(apiCall.request, null, 2)}
                                  </pre>
                                </div>
                                <div>
                                  <strong className="text-gray-700">Response:</strong>
                                  <pre className="bg-gray-50 p-3 rounded mt-1 overflow-auto max-h-32 border border-gray-200">
                                    {JSON.stringify(apiCall.response, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </details>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

