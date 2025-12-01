"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import StageHeader from "@/components/stage-header"

// 每个section的提示
const SECTION_HINTS: Record<string, Record<string, string>> = {
  recommendation: {
    "Introduction - Hook your readers": "✨ Start with what made you pick up this book - hook your readers! Share why you chose it and what caught your attention.",
    "What I Loved - Share your favorite parts": "💝 Share specific parts you loved - characters, plot twists, emotions, or moments that stood out to you.",
    "Why You Should Read It - Make your case": "🌟 Be genuine - tell readers why YOU think they should read it. What makes it special?",
    "Who Would Enjoy This - Help readers decide": "📚 Mention who might enjoy this book - age group, interests, reading style, or personality types.",
    "Conclusion - Final recommendation": "🎯 End with a clear recommendation that makes readers excited! Would you read it again?",
  },
  critical: {
    "Introduction - Set the stage": "🔍 Introduce the book and your overall approach - you'll look at both strengths and weaknesses.",
    "Strengths - What worked well": "💪 Mention what worked well - characters, writing style, themes, pacing, or other strong points.",
    "Weaknesses - What didn't work": "⚠️ Point out what didn't work - plot holes, pacing issues, confusing parts, or areas that fell short.",
    "Examples - Support your points": "📝 Use specific examples from the book to support your points about strengths and weaknesses.",
    "Conclusion - Overall assessment": "🎯 Give an honest overall assessment - what's your final verdict? Would you recommend it despite flaws?",
  },
  literary: {
    "Introduction - Present the book": "📖 Introduce the book and its main themes - what deeper meanings does it explore?",
    "Themes - Explore deeper meanings": "💭 Explore the deeper meanings - what themes does the book explore? What messages is the author conveying?",
    "Literary Devices - Analyze techniques": "🎨 Look for symbols, metaphors, and literary devices the author uses - how do they enhance the story?",
    "Character Analysis - Understand development": "👥 Analyze how characters develop and what they represent - what do they teach us?",
    "Conclusion - Reflect on significance": "✍️ Connect the book's message to bigger ideas about life and society - what is its lasting significance?",
  },
}

interface BookReviewWritingNoAiProps {
  reviewType: "recommendation" | "critical" | "literary"
  bookTitle: string
  structure: {
    type: "recommendation" | "critical" | "literary"
    outline: string[]
  }
  initialCoverUrl?: string
  onReviewWrite: (review: string, bookCoverUrl?: string) => void
  onBack: () => void
  userId?: string
}

// Enhanced word count function that handles both English and Chinese
const countWords = (text: string): number => {
  if (!text || !text.trim()) return 0
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const englishText = text.replace(/[\u4e00-\u9fff]/g, ' ').trim()
  const englishWords = englishText ? englishText.split(/\s+/).filter(word => word.length > 0).length : 0
  return chineseChars + englishWords
}

export default function BookReviewWritingNoAi({ 
  reviewType, 
  bookTitle, 
  structure,
  initialCoverUrl = undefined,
  onReviewWrite, 
  onBack, 
  userId 
}: BookReviewWritingNoAiProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [sectionTexts, setSectionTexts] = useState<Record<number, string>>({})
  const [bookCoverUrl] = useState<string | null>(initialCoverUrl || null)

  const sections = structure?.outline || []
  const currentSectionText = sectionTexts[currentSection] || ""

  const wordCount = useMemo(() => {
    const allText = Object.values(sectionTexts).join(' ')
    return countWords(allText)
  }, [sectionTexts])

  // 检测test模式
  const isTestMode = useMemo(() => {
    return Object.values(sectionTexts).some(text => text.trim().toLowerCase() === "test")
  }, [sectionTexts])

  const handleSectionTextChange = (sectionIndex: number, text: string) => {
    setSectionTexts(prev => ({
      ...prev,
      [sectionIndex]: text
    }))
    
    // 如果输入"test"，自动标记该section为完成（类似AI版本）
    if (text.trim().toLowerCase() === "test") {
      // 可以在这里添加一些视觉反馈
    }
  }

  const handlePublish = async () => {
    // Test mode: 跳过字数检查
    if (!isTestMode && wordCount < 50) {
      toast.error("Your review needs at least 50 words")
      return
    }

    const fullReview = sections.map((_, index) => {
      const sectionText = sectionTexts[index] || ""
      return `${sections[index]}:\n${sectionText}`
    }).join('\n\n')

    // 保存到后端（类似story-review.tsx）
    try {
      await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId || "default-user",
          stage: "bookReviewComplete",
          type: "bookReview",
          data: {
            review: fullReview,
            reviewType,
            bookTitle,
            bookCoverUrl: bookCoverUrl || undefined,
          },
          review: fullReview,
          reviewType,
          bookTitle,
          bookCoverUrl: bookCoverUrl || undefined,
        }),
      })
    } catch (error) {
      console.error("Error saving review:", error)
    }

    if (onReviewWrite && typeof onReviewWrite === 'function') {
      onReviewWrite(fullReview, bookCoverUrl || undefined)
    } else {
      console.error("onReviewWrite is not a function:", typeof onReviewWrite, onReviewWrite)
      toast.error("Error: Review callback not configured")
    }
  }

  const handleSectionChange = (index: number) => {
    if (index === currentSection) return
    setCurrentSection(index)
  }

  const reviewTypeNames = {
    recommendation: "Recommendation Review",
    critical: "Critical Review",
    literary: "Literary Review",
  }

  // 获取当前section的提示
  const currentSectionHint = SECTION_HINTS[reviewType]?.[sections[currentSection]] || "Write your thoughts about this section."

  return (
    <div className="min-h-screen py-6 px-4 bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50" style={{ paddingTop: '100px' }}>
      <div className="max-w-7xl mx-auto">
        <StageHeader onBack={onBack} />

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Write Your Book Review
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            <span className="font-bold">{reviewTypeNames[reviewType]}</span> for <span className="font-bold italic">{bookTitle}</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-200 shadow-xl">
              {/* Section Navigation */}
              <div className="mb-6">
                <label className="block text-xl font-bold mb-4 text-purple-700 flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Review Sections
                </label>
                <div className="flex gap-3 mb-6 overflow-x-auto pb-3 scrollbar-purple">
                  {sections.map((section, i) => (
                    <button
                      key={i}
                      onClick={() => handleSectionChange(i)}
                      className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-lg transform hover:scale-105 flex-shrink-0 ${
                        currentSection === i
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 ring-4 ring-purple-300 animate-pulse"
                          : "bg-white border-2 border-purple-200 hover:border-purple-300 text-purple-700 hover:shadow-md"
                      }`}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Hint */}
              <div className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200 shadow-lg">
                <p className="text-sm font-medium text-gray-700 leading-relaxed">
                  {currentSectionHint}
                </p>
              </div>

              {/* Current Section Writing */}
              <div className="mb-6">
                <label className="block text-xl font-bold mb-4 text-purple-700">
                  {sections[currentSection]}
                </label>
                <textarea
                  value={currentSectionText}
                  onChange={(e) => handleSectionTextChange(currentSection, e.target.value)}
                  placeholder={`Write your ${sections[currentSection]} here...`}
                  className="w-full min-h-[300px] p-4 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-300 focus:outline-none resize-y text-base"
                  style={{ fontFamily: 'var(--font-comic-neue)' }}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {countWords(currentSectionText)} words in this section
                </p>
              </div>

              {/* Publish Button */}
              <div className="flex justify-end gap-4">
                <Button
                  onClick={handlePublish}
                  disabled={(!isTestMode && wordCount < 50)}
                  className={`border-0 shadow-xl py-6 px-12 text-lg font-bold rounded-xl transition-all ${
                    (isTestMode || wordCount >= 50)
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isTestMode ? (
                    <>
                      <span className="text-2xl">🎉</span>
                      Finish Review (Test Mode)
                    </>
                  ) : wordCount < 50 ? (
                    <>
                      <span>📝</span>
                      Finish Review ({wordCount}/50 words)
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">🎉</span>
                      Finish Review
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Word Count */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl p-6 border-4 border-purple-300 shadow-2xl backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4 text-purple-700 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Word Count
              </h3>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-700 mb-2">{wordCount}</p>
                <p className="text-sm text-gray-600">words written</p>
                {isTestMode ? (
                  <p className="text-xs text-green-600 mt-2 font-semibold">
                    ✓ Test Mode Active
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">
                    {wordCount >= 50 ? "✓ Minimum reached" : `Need ${50 - wordCount} more words`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

