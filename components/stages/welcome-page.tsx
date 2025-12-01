"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ProgressMentor from "@/components/progress-mentor"
import type { Language } from "@/app/page"

interface WelcomePageProps {
  language: Language
  onLanguageChange: (language: Language) => void
  onStart: () => void
  onBack?: () => void
  userId?: string
}

const translations = {
  en: {
    title: "Story",
    subtitle: "Create magical stories with help from your AI mentor",
    startButton: "🚀 Start Creating",
    features: [
      { icon: "🎭", title: "Create Characters", desc: "Design unique story characters", gradient: "from-purple-500 to-pink-500" },
      { icon: "🧠", title: "Brainstorm Ideas", desc: "Develop your plot with AI help", gradient: "from-blue-500 to-cyan-500" },
      { icon: "📖", title: "Write Stories", desc: "Bring your imagination to life", gradient: "from-orange-500 to-red-500" },
    ]
  },
  zh: {
    title: "故事",
    subtitle: "喺AI導師嘅幫助下創造魔法故事",
    startButton: "🚀 開始創作",
    features: [
      { icon: "🎭", title: "創造角色", desc: "設計獨特嘅故事角色", gradient: "from-purple-500 to-pink-500" },
      { icon: "🧠", title: "頭腦風暴", desc: "喺AI幫助下開發你嘅情節", gradient: "from-blue-500 to-cyan-500" },
      { icon: "📖", title: "編寫故事", desc: "讓你嘅想象力成真", gradient: "from-orange-500 to-red-500" },
    ]
  }
}

export default function WelcomePage({ language, onLanguageChange, onStart, onBack, userId }: WelcomePageProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [currentAction, setCurrentAction] = useState<string>("")
  // 确保 language 值有效，如果不在 translations 中则使用默认值 "en"
  const validLanguage = (language && language in translations) ? language : "en"
  const t = translations[validLanguage as keyof typeof translations]
  const features = t?.features || []

  const handleLanguageChange = (lang: Language) => {
    setCurrentAction(`Changed language to ${lang}`)
    onLanguageChange(lang)
  }

  const handleStart = () => {
    setCurrentAction("Clicked Start Creating button")
    onStart()
  }

  const handleBack = () => {
    if (onBack) {
      setCurrentAction("Clicked back to home")
      onBack()
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 via-pink-50 to-orange-50 relative">
      {/* Progress Mentor */}
      <ProgressMentor
        stage="welcome"
        action={currentAction}
        context={{}}
        userId={userId}
      />
      {/* 高级背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
        {/* 额外的装饰元素 */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
        
        {/* 创意元素：画笔 */}
        <div className="absolute top-32 right-32 text-6xl opacity-20 animate-paint-brush" style={{ animationDelay: '0.5s' }}>🖌️</div>
        <div className="absolute top-48 left-48 text-5xl opacity-15 animate-paint-brush" style={{ animationDelay: '1.5s' }}>🎨</div>
        
        {/* 创意元素：音符 */}
        <div className="absolute top-64 right-64 text-4xl opacity-15 animate-music-note" style={{ animationDelay: '0s' }}>🎵</div>
        <div className="absolute bottom-32 left-32 text-4xl opacity-15 animate-music-note" style={{ animationDelay: '1s' }}>🎶</div>
        <div className="absolute top-96 left-96 text-3xl opacity-10 animate-music-note" style={{ animationDelay: '2s' }}>🎼</div>
        
        {/* 创意元素：星星和魔法 */}
        <div className="absolute top-1/4 right-1/4 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.3s' }}>✨</div>
        <div className="absolute bottom-1/3 left-1/3 text-4xl opacity-15 animate-float" style={{ animationDelay: '1.2s' }}>⭐</div>
        <div className="absolute top-1/3 left-1/4 text-4xl opacity-15 animate-float" style={{ animationDelay: '2.1s' }}>💫</div>
      </div>
      
      {/* 网格背景 */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* 创意装饰：流动的线条 */}
      <svg className="absolute inset-0 opacity-10 pointer-events-none" style={{ zIndex: 0 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path d="M 0,200 Q 200,100 400,200 T 800,200" stroke="url(#lineGradient)" strokeWidth="2" fill="none" className="animate-pulse" />
        <path d="M 0,400 Q 300,300 600,400 T 1200,400" stroke="url(#lineGradient)" strokeWidth="2" fill="none" className="animate-pulse" style={{ animationDelay: '1s' }} />
      </svg>

      {/* 顶部导航栏 */}
      <div className="relative z-10 flex justify-end items-center p-6">
        <div className="flex gap-3">
          <Button
            onClick={() => handleLanguageChange("en")}
            variant={language === "en" ? "default" : "outline"}
            className={`${language === "en" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg" : "bg-white/80 backdrop-blur-lg border-2 border-purple-200 hover:bg-purple-50"} font-bold`}
          >
            EN
          </Button>
          <Button
            onClick={() => handleLanguageChange("zh")}
            variant={language === "zh" ? "default" : "outline"}
            className={`${language === "zh" ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 shadow-lg" : "bg-white/80 backdrop-blur-lg border-2 border-blue-200 hover:bg-blue-50"} font-bold`}
          >
            粤语
          </Button>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <div className="max-w-4xl w-full text-center">
          {/* 主图标 - 高级设计 */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            </div>
            <div className="relative inline-block p-8 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-full shadow-2xl animate-bounce border-4 border-white/30 backdrop-blur-sm">
              <span className="text-7xl drop-shadow-lg">✨</span>
            </div>
          </div>

          {/* 主Logo/标题区域 - 增强设计 */}
          <div className="mb-8 relative">
            {/* 标题周围的装饰 */}
            <div className="absolute -top-4 -left-4 text-4xl opacity-30 animate-float">🎨</div>
            <div className="absolute -top-4 -right-4 text-4xl opacity-30 animate-float" style={{ animationDelay: '0.5s' }}>✍️</div>
            <div className="absolute -bottom-4 -left-8 text-4xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>📝</div>
            <div className="absolute -bottom-4 -right-8 text-4xl opacity-30 animate-float" style={{ animationDelay: '1.5s' }}>🖋️</div>
            
            {/* 标题 */}
            <h1 className="text-6xl md:text-7xl font-extrabold mb-4 relative">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent drop-shadow-lg">
                {t.title}
              </span>
              {/* 标题下方的装饰线 */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full"></div>
            </h1>
            
            {/* 副标题 */}
            <p className="text-2xl md:text-3xl text-gray-700 mb-12 font-medium">
              {t.subtitle}
            </p>
          </div>

          {/* Start按钮 - 增强设计 */}
          <div className="mb-16 relative">
            {/* 按钮周围的装饰 */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-3xl opacity-20 animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-3xl opacity-20 animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</div>
            
                   <Button
                     onClick={handleStart}
                     size="lg"
                     className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white border-0 shadow-2xl py-8 px-12 text-xl font-bold animate-pulse hover:scale-105 transition-transform duration-300"
                   >
                     <span className="relative z-10">{t.startButton}</span>
                     {/* 按钮内部光效 */}
                     <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg"></div>
                   </Button>
          </div>

          {/* 功能卡片 - 高级设计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {features.map((feature, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative bg-white/90 backdrop-blur-lg rounded-3xl p-8 border-2 border-gray-200 shadow-xl transition-all duration-500 overflow-hidden ${
                  hoveredIndex === i 
                    ? "scale-110 rotate-3 shadow-2xl border-purple-300 transform-gpu" 
                    : "hover:scale-105 hover:shadow-2xl"
                }`}
                style={{
                  animation: hoveredIndex === i ? 'pulse 2s ease-in-out infinite' : undefined,
                  transform: hoveredIndex === i ? 'perspective(1000px) rotateY(5deg) rotateX(5deg)' : undefined,
                }}
              >
                {/* 卡片内部光效 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 ${
                  hoveredIndex === i ? "opacity-10" : ""
                }`}></div>
                
                {/* 装饰性边框动画 */}
                <div className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r ${feature.gradient} opacity-0 transition-opacity duration-500 ${
                  hoveredIndex === i ? "opacity-30" : ""
                }`} style={{ padding: '2px' }}>
                  <div className="w-full h-full bg-white/90 rounded-3xl"></div>
                </div>
                
                <div className="relative z-10">
                  <div 
                    className={`text-6xl mb-4 transition-all duration-500 animate-float ${
                      hoveredIndex === i 
                        ? "animate-bounce scale-125" 
                        : "hover:scale-110"
                    }`}
                    style={{
                      animationDelay: `${i * 0.2}s`
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-3 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent transition-all duration-300 ${
                    hoveredIndex === i ? "scale-110" : ""
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-gray-600 font-medium transition-all duration-300 ${
                    hoveredIndex === i ? "text-gray-800 font-semibold" : ""
                  }`}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
