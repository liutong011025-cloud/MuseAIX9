"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Language } from "@/app/page"

interface WriteTypeSelectionProps {
  language?: Language
  onSelectStory?: () => void
  onSelectBookReview?: () => void
  onSelectLetter?: () => void
  onBack?: () => void
}

const translations = {
  en: {
    title: "Choose Your Writing Adventure",
    subtitle: "Pick the type of writing that excites you most!",
    bottomTip: "Each writing type helps you practice different skills. Choose the one that sounds most fun to you!",
    back: "← Back",
    storyTitle: "Story Writing",
    storyDesc: "Create magical stories with help from your AI mentor",
    storyFeatures: [
      "Create unique characters",
      "Build exciting plots",
      "Write amazing adventures",
      "Share your imagination"
    ],
    storyPrompt: "Once upon a time...",
    bookTitle: "Book Review",
    bookDesc: "Write thoughtful book reviews with AI assistance",
    bookFeatures: [
      "Share your opinions",
      "Give reasons and examples",
      "Help others find great books",
      "Practice critical thinking"
    ],
    bookPrompt: "This book is great because...",
    letterTitle: "Letter Writing",
    letterDesc: "Compose letters with creative writing support",
    letterFeatures: [
      "Express your feelings",
      "Share real experiences",
      "Connect with friends",
      "Practice friendly tone"
    ],
    letterPrompt: "Hi! Guess what I did today?"
  },
  zh: {
    title: "選擇你嘅寫作冒險",
    subtitle: "選擇最令你興奮嘅寫作類型！",
    bottomTip: "每種寫作類型都幫助你練習唔同技能。選擇最有趣嘅一個！",
    back: "← 返回",
    storyTitle: "故事寫作",
    storyDesc: "喺AI導師嘅幫助下創造魔法故事",
    storyFeatures: [
      "創造獨特角色",
      "構建精彩情節",
      "寫出精彩冒險",
      "分享你嘅想像"
    ],
    storyPrompt: "從前...",
    bookTitle: "書評",
    bookDesc: "喺AI協助下寫出深思熟慮嘅書評",
    bookFeatures: [
      "分享你嘅意見",
      "提供理由同例子",
      "幫助其他人找到好書",
      "練習批判性思維"
    ],
    bookPrompt: "呢本書好棒因為...",
    letterTitle: "書信寫作",
    letterDesc: "喺創意寫作支援下撰寫書信",
    letterFeatures: [
      "表達你嘅感受",
      "分享真實經歷",
      "與朋友聯繫",
      "練習友好語氣"
    ],
    letterPrompt: "你好！猜猜我今日做咗咩？"
  },
}

const getWritingTypes = (language: Language = "en") => {
  const t = translations[language] || translations.en
  return [
    {
      id: "story",
      title: t.storyTitle,
      icon: "📖",
      description: t.storyDesc,
      gradient: "from-purple-600 via-pink-600 to-orange-600",
      hoverGradient: "from-purple-700 via-pink-700 to-orange-700",
      borderColor: "border-purple-200",
      features: t.storyFeatures,
      prompt: t.storyPrompt
    },
    {
      id: "bookReview",
      title: t.bookTitle,
      icon: "📝",
      description: t.bookDesc,
      gradient: "from-blue-600 to-cyan-600",
      hoverGradient: "from-blue-700 to-cyan-700",
      borderColor: "border-blue-200",
      features: t.bookFeatures,
      prompt: t.bookPrompt
    },
    {
      id: "letter",
      title: t.letterTitle,
      icon: "✉️",
      description: t.letterDesc,
      gradient: "from-green-600 to-emerald-600",
      hoverGradient: "from-green-700 to-emerald-700",
      borderColor: "border-green-200",
      features: t.letterFeatures,
      prompt: t.letterPrompt
    }
  ]
}

export default function WriteTypeSelection({ 
  language = "en",
  onSelectStory, 
  onSelectBookReview, 
  onSelectLetter,
  onBack 
}: WriteTypeSelectionProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const t = translations[language] || translations.en
  const writingTypes = getWritingTypes(language)

  const handleSelect = (type: string) => {
    if (type === "story") {
      onSelectStory?.()
    } else if (type === "bookReview") {
      onSelectBookReview?.()
    } else if (type === "letter") {
      onSelectLetter?.()
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 via-orange-50 to-yellow-50">
      {/* 装饰性背景元素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-20 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 min-h-screen px-6 lg:px-12 py-12 lg:py-20" style={{ paddingTop: '128px' }}>
        {/* 返回按钮 */}
        {onBack && (
          <div className="mb-6">
            <Button
              onClick={onBack}
              variant="outline"
              className="bg-white/80 backdrop-blur-lg border-2 border-gray-300 hover:bg-gray-50 text-gray-700 shadow-lg font-bold"
            >
              {t.back}
            </Button>
          </div>
        )}

        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* 三种写作类型卡片 */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {writingTypes.map((type, index) => {
            const isHovered = hoveredCard === type.id
            return (
              <div
                key={type.id}
                onMouseEnter={() => setHoveredCard(type.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleSelect(type.id)}
                className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 border-2 border-gray-200 shadow-xl transition-all duration-500 cursor-pointer animate-fade-in"
                style={{ 
                  animationDelay: `${index * 0.15}s`,
                  transform: isHovered ? 'scale(1.05) translateY(-0.5rem)' : 'scale(1)',
                }}
              >
                {/* 卡片装饰性边框 */}
                <div className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r ${type.gradient} opacity-0 transition-opacity duration-500 ${
                  isHovered ? "opacity-30" : ""
                }`} style={{ padding: '2px', borderRadius: '1.5rem' }}>
                  <div className="w-full h-full bg-white/95 backdrop-blur-md rounded-3xl"></div>
                </div>
                
                <div className="relative z-10 text-center">
                  {/* 图标 */}
                  <div 
                    className={`text-8xl mb-6 transition-all duration-500 ${
                      isHovered
                        ? "scale-125 rotate-6" 
                        : ""
                    }`}
                  >
                    {type.icon}
                  </div>
                  
                  {/* 标题 */}
                  <h2 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${type.gradient} bg-clip-text text-transparent transition-all duration-300 ${
                    isHovered ? "scale-110" : ""
                  }`}>
                    {type.title}
                  </h2>
                  
                  {/* 描述 */}
                  <p className="text-base text-gray-700 leading-relaxed mb-6">
                    {type.description}
                  </p>
                  
                  {/* 特性列表 */}
                  <div className="space-y-2 mb-6">
                    {type.features.map((feature, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-center gap-2 text-sm text-gray-600"
                      >
                        <span className="text-purple-500">✨</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* 提示句 */}
                  <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-xl p-4 border border-purple-200">
                    <p className="text-sm text-gray-600 italic">
                      "{type.prompt}"
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 底部提示 */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-lg text-gray-600 leading-relaxed">
            {t.bottomTip}
          </p>
        </div>
      </div>
    </div>
  )
}


