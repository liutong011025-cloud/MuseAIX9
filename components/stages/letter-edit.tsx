"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import StageHeader from "@/components/stage-header"
import { Sparkles, Save, ArrowLeft } from "lucide-react"
import Image from "next/image"
import type { Language } from "@/app/page"

interface LetterEditProps {
  language: Language
  recipient: string
  occasion: string
  letter: string
  guidance?: string | null
  readerImageUrl?: string | null
  sections?: string[]
  onSave: (updatedLetter: string) => void
  onBack: () => void
  onNavigateToGallery?: () => void
  userId?: string
  workId?: string | null
}

export default function LetterEdit({
  language,
  recipient,
  occasion,
  letter,
  guidance,
  readerImageUrl,
  sections,
  onSave,
  onBack,
  onNavigateToGallery,
  userId,
  workId,
}: LetterEditProps) {
  const [editedLetter, setEditedLetter] = useState(letter || "")
  const [originalLetter, setOriginalLetter] = useState(letter || "")
  const [isSaving, setIsSaving] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)
  const lastModifiedRef = useRef<string>("")
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 当内容改变时，延迟调用AI获取建议
  useEffect(() => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current)
    }

    // 如果内容有实际改变，延迟1.5秒后获取AI建议
    if (editedLetter !== originalLetter && editedLetter !== lastModifiedRef.current) {
      suggestionTimeoutRef.current = setTimeout(() => {
        getAISuggestion()
        lastModifiedRef.current = editedLetter
      }, 1500)
    }

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current)
      }
    }
  }, [editedLetter, originalLetter])

  const getAISuggestion = async () => {
    if (!editedLetter || editedLetter === originalLetter) return

    setIsLoadingSuggestion(true)
    setAiSuggestion(null)

    try {
      const response = await fetch("/api/dify-edit-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article_type: "letter",
          original_content: originalLetter,
          modified_content: editedLetter,
          user_id: userId || "default-user",
        }),
      })

      const data = await response.json()
      if (data.success && data.suggestion) {
        setAiSuggestion(data.suggestion)
      } else {
        console.error("Failed to get AI suggestion:", data.error)
      }
    } catch (error) {
      console.error("Error getting AI suggestion:", error)
    } finally {
      setIsLoadingSuggestion(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 保存到数据库
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          stage: "letterComplete",
          input: {
            recipient,
            occasion,
            sections: sections || [],
          },
          output: {
            letter: editedLetter,
            guidance: guidance || null,
            readerImageUrl: readerImageUrl || null,
          },
          letter: editedLetter,
          recipient,
          occasion,
          guidance: guidance || null,
          readerImageUrl: readerImageUrl || null,
          workId: workId || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Letter updated successfully! ✨")
        onSave(editedLetter)
      } else {
        toast.error("Failed to save letter")
      }
    } catch (error) {
      console.error("Error saving letter:", error)
      toast.error("Failed to save letter")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-6 bg-gradient-to-br from-pink-100 via-purple-50 to-orange-50 relative" style={{ paddingTop: '100px' }}>
      <StageHeader language={language} />
      
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
            Edit Your Letter ✏️
          </h1>
          <p className="text-gray-600">Make changes to your letter. AI will provide helpful suggestions!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧：信件信息 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border-2 border-pink-200 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-pink-700">Letter Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Recipient</p>
                  <p className="text-lg font-bold text-pink-700">{recipient}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Occasion</p>
                  <p className="text-lg font-bold text-purple-700">{occasion}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 中间：编辑区域和AI建议 */}
          <div className="lg:col-span-2 relative">
            {/* 编辑文本框 - 固定宽度，不受 Muse 影响 */}
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border-2 border-pink-200 shadow-xl">
              <label className="block text-lg font-bold mb-3 text-pink-700">
                Your Letter
              </label>
              <Textarea
                value={editedLetter}
                onChange={(e) => setEditedLetter(e.target.value)}
                className="min-h-[400px] text-base leading-relaxed border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 rounded-xl p-4 w-full"
                placeholder="Start editing your letter here..."
              />
              <div className="mt-4">
                <Button
                  onClick={() => {
                    if (onNavigateToGallery) {
                      onNavigateToGallery()
                    }
                  }}
                  variant="outline"
                  className="bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 border-2 border-purple-300 shadow-md"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Need inspiration? Check out others' works!
                </Button>
              </div>
            </div>

            {/* AI 建议 - 绝对定位在右侧，不影响文本框 */}
            {(aiSuggestion || isLoadingSuggestion) && (
              <div className="absolute right-0 top-0 w-80 transform translate-x-full ml-6 z-10">
                <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-2xl p-5 border-4 border-pink-200 backdrop-blur-sm relative">
                  {/* 说话气泡的尾巴 - 指向左边 */}
                  <div className="absolute left-0 top-8 w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[20px] border-r-pink-200 transform -translate-x-full"></div>
                  <div className="absolute left-0 top-[33px] w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[16px] border-r-pink-50 transform -translate-x-full"></div>
                  
                  <div className="flex items-start gap-3">
                    {/* Muse Avatar - 无边框无阴影 */}
                    <div className="flex-shrink-0">
                      <Image
                        src="/muse-avatar.png"
                        alt="Muse"
                        width={60}
                        height={60}
                        className="rounded-full"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-purple-700 text-sm">Muse</span>
                        {isLoadingSuggestion && (
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        )}
                      </div>
                      {isLoadingSuggestion ? (
                        <p className="text-sm text-purple-600">Thinking...</p>
                      ) : aiSuggestion ? (
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {aiSuggestion}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 保存按钮 */}
            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleSave}
                disabled={isSaving || editedLetter === originalLetter}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-xl py-6 text-lg font-bold disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

