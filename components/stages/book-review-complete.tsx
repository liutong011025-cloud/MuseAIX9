"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"

interface BookReviewCompleteProps {
  reviewType: "recommendation" | "critical" | "literary"
  bookTitle: string
  review: string
  bookCoverUrl?: string
  bookSummary?: string
  structure?: {
    type: "recommendation" | "critical" | "literary"
    outline: string[]
  } | null
  onReset: () => void
  onBack: () => void
  onEdit?: () => void
  userId?: string
  isNoAi?: boolean
  workId?: string | null // 如果提供，表示正在编辑已保存的作品
}

const reviewTypeNames = {
  recommendation: "Recommendation Review",
  critical: "Critical Review",
  literary: "Literary Review",
}

export default function BookReviewComplete({
  reviewType,
  bookTitle,
  review,
  bookCoverUrl,
  bookSummary,
  structure,
  onReset,
  onBack,
  onEdit,
  userId,
  isNoAi = false,
  workId,
}: BookReviewCompleteProps) {
  const [copied, setCopied] = useState(false)
  const hasSavedRef = useRef(false)

  // 自动保存到 gallery
  useEffect(() => {
    if (review && !hasSavedRef.current) {
      hasSavedRef.current = true
      console.log('Saving book review to gallery:', {
        userId,
        reviewType,
        bookTitle,
        hasReview: !!review,
        hasCover: !!bookCoverUrl
      })
      
      fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId || "default-user",
          stage: "bookReviewComplete",
          review,
          reviewType,
          bookTitle,
          bookCoverUrl,
          bookSummary: bookSummary || "", // 传递 bookSummary
          review, // 传递 review 内容
          workId: workId || undefined, // 如果正在编辑，传递 workId
        }),
      })
      .then(res => res.json())
      .then(data => {
        console.log('Book review saved successfully:', data)
        if (data.success) {
          toast.success("Review saved to gallery!")
        }
      })
      .catch((error) => {
        console.error("Error saving review to interactions:", error)
        hasSavedRef.current = false
        toast.error("Failed to save review to gallery")
      })
    }
  }, [review, reviewType, bookTitle, bookCoverUrl, userId])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(review)
      setCopied(true)
      toast.success("Review copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy review")
    }
  }

  const handleSave = async () => {
    try {
      // 保存到后端
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId || "default-user",
          stage: "bookReviewComplete",
          type: "bookReview",
          data: {
            review,
            reviewType,
            bookTitle,
            bookCoverUrl,
          },
          review,
          reviewType,
          bookTitle,
          bookCoverUrl,
        }),
      })

      if (response.ok) {
        toast.success("Review saved successfully!")
      }
    } catch (error) {
      console.error("Error saving review:", error)
      toast.error("Failed to save review")
    }
  }

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10" style={{ paddingTop: '80px' }}>
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent animate-pulse">
            🎉 Your Review is Complete! 🎉
          </h1>
          <p className="text-2xl text-gray-700 mb-4">
            {reviewTypeNames[reviewType]} for <strong>{bookTitle}</strong>
          </p>
        </div>

        <div className={isNoAi ? "max-w-4xl mx-auto" : "grid lg:grid-cols-12 gap-8"}>
          {/* 左侧：书封面 - 非AI用户不显示 */}
          {!isNoAi && (
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl p-8 border-4 border-amber-300 shadow-2xl backdrop-blur-sm sticky top-8">
                <h2 className="text-2xl font-bold mb-6 text-amber-700 flex items-center gap-2">
                  <span className="text-3xl">📖</span>
                  Book Cover
                </h2>
                {bookCoverUrl ? (
                  <div className="relative w-full max-w-[200px] mx-auto aspect-[2/3] rounded-xl overflow-hidden border-4 border-amber-400 shadow-xl">
                    <Image
                      src={bookCoverUrl}
                      alt={`Cover of ${bookTitle}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-[2/3] rounded-xl bg-gray-200 flex items-center justify-center border-4 border-amber-400 shadow-xl">
                    <p className="text-gray-500">Cover generating...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 右侧：完成的review */}
          <div className={isNoAi ? "" : "lg:col-span-8"}>
            <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl p-10 border-4 border-purple-300 shadow-2xl backdrop-blur-sm relative overflow-hidden">
              {/* 纸张纹理效果 */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
              }}></div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-6 text-purple-700 flex items-center gap-3">
                  <span className="text-4xl">✨</span>
                  Your Complete Review
                </h2>

                <div className="bg-white/90 rounded-2xl p-8 border-3 border-purple-200 shadow-lg mb-6">
                  <pre className="whitespace-pre-wrap text-gray-800 text-lg leading-relaxed font-serif" style={{ fontFamily: 'var(--font-comic-neue)' }}>
                    {review}
                  </pre>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    onClick={handleCopy}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-xl py-6 px-8 text-lg font-bold rounded-full hover:scale-105 transition-all duration-300"
                  >
                    {copied ? (
                      <>
                        <span className="text-2xl mr-2">✓</span>
                        Copied!
                      </>
                    ) : (
                      <>
                        <span className="text-xl mr-2">📋</span>
                        Copy Review
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleSave}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-xl py-6 px-8 text-lg font-bold rounded-full hover:scale-105 transition-all duration-300"
                  >
                    <span className="text-xl mr-2">💾</span>
                    Save Review
                  </Button>

                  <Button
                    onClick={onReset}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white border-0 shadow-xl py-6 px-8 text-lg font-bold rounded-full hover:scale-105 transition-all duration-300"
                  >
                    <span className="text-xl mr-2">🏠</span>
                    Back to Home
                  </Button>

                  <Button
                    onClick={() => {
                      if (onEdit) {
                        onEdit()
                      } else {
                        onBack()
                      }
                    }}
                    variant="outline"
                    size="lg"
                    className="bg-white/80 backdrop-blur-lg border-3 border-gray-300 hover:bg-gray-50 text-gray-700 shadow-lg py-6 px-8 text-lg font-bold rounded-full hover:scale-105 transition-all duration-300"
                  >
                    <span className="text-xl mr-2">←</span>
                    Edit Review
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

