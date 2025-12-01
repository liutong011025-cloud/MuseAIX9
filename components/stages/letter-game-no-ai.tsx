"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mail, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import StageHeader from "@/components/stage-header"

interface LetterGameNoAiProps {
  recipient: string
  occasion: string
  onComplete: (sections: string[]) => void
  onBack: () => void
  userId?: string
}

// 默认的信件结构
const LETTER_SECTIONS = [
  { name: "Greeting", emoji: "👋", placeholder: "Dear [name], Hello! How are you?" },
  { name: "Opening", emoji: "💬", placeholder: "I'm writing to tell you..." },
  { name: "Body", emoji: "📝", placeholder: "Here's what I want to share..." },
  { name: "Closing", emoji: "💝", placeholder: "I hope to hear from you soon!" },
  { name: "Signature", emoji: "✍️", placeholder: "Love, [Your name]" }
]

export default function LetterGameNoAi({
  recipient,
  occasion,
  onComplete,
  onBack,
  userId
}: LetterGameNoAiProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [sectionTexts, setSectionTexts] = useState<Record<number, string>>({})

  const currentSectionText = sectionTexts[currentSection] || ""

  const handleTextChange = (text: string) => {
    setSectionTexts(prev => ({ ...prev, [currentSection]: text }))
  }

  const handleNext = () => {
    if (currentSection < LETTER_SECTIONS.length - 1) {
      setCurrentSection(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1)
    }
  }

  const handleFinish = () => {
    const sections = LETTER_SECTIONS.map((_, index) => sectionTexts[index] || "")
    onComplete(sections)
  }

  const canFinish = LETTER_SECTIONS.every((_, index) => {
    const text = sectionTexts[index] || ""
    const testPattern = `test${index + 1}`
    if (text.toLowerCase().trim() === testPattern.toLowerCase()) return true
    return text.trim().length > 0
  })

  const progress = (Object.keys(sectionTexts).filter(key => sectionTexts[Number(key)]?.trim().length > 0).length / LETTER_SECTIONS.length) * 100

  return (
    <div className="min-h-screen py-6 px-4 bg-gradient-to-br from-pink-100 via-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10" style={{ paddingTop: '80px' }}>
        <StageHeader onBack={onBack} />

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center items-center gap-3">
            <Mail className="w-12 h-12 text-pink-600 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Write Your Letter
            </h1>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-xl px-6 py-3 inline-block border-2 border-pink-200 shadow-lg mb-4">
            <p className="text-lg text-gray-700">
              To: <span className="font-bold text-pink-700">{recipient}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              💭 {occasion}
            </p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-6 bg-white/90 backdrop-blur-lg rounded-2xl p-6 border-4 border-purple-300 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-purple-700">📊 Your Progress</h3>
            <div className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-4 gap-2">
            {LETTER_SECTIONS.map((section, index) => (
              <button
                key={index}
                onClick={() => setCurrentSection(index)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  currentSection === index
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white scale-105 shadow-lg"
                    : sectionTexts[index]?.trim().length > 0
                    ? "bg-green-100 text-green-700 border-2 border-green-300"
                    : "bg-gray-100 text-gray-600 border-2 border-gray-200"
                }`}
              >
                <div className="text-lg mb-1">{section.emoji}</div>
                <div className="text-xs">{section.name}</div>
                {sectionTexts[index]?.trim().length > 0 && (
                  <CheckCircle2 className="w-4 h-4 mx-auto mt-1 text-green-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 主写作区域 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* 左侧：写作区 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border-4 border-pink-300 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{LETTER_SECTIONS[currentSection].emoji}</span>
                <h2 className="text-2xl font-bold text-pink-700">
                  {LETTER_SECTIONS[currentSection].name}
                </h2>
              </div>
              
              <Textarea
                value={currentSectionText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={LETTER_SECTIONS[currentSection].placeholder.replace('[name]', recipient)}
                className="w-full min-h-[300px] p-4 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-300 focus:outline-none resize-y text-base"
                style={{ fontFamily: 'var(--font-comic-neue)' }}
              />
              
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-500">
                  {currentSectionText.trim().length} characters
                </p>
                <div className="flex gap-2">
                  {currentSection > 0 && (
                    <Button
                      onClick={handlePrevious}
                      variant="outline"
                      className="border-2 border-gray-300"
                    >
                      ← Previous
                    </Button>
                  )}
                  {currentSection < LETTER_SECTIONS.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      Next →
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinish}
                      disabled={!canFinish}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Finish Letter
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：提示 */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-300 shadow-lg">
              <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <span>💡</span>
                <span>Writing Tip</span>
              </h4>
              <p className="text-sm text-yellow-700">
                {LETTER_SECTIONS[currentSection].name === "Greeting" && "Start with a friendly greeting! Say hello and ask how they are. 👋"}
                {LETTER_SECTIONS[currentSection].name === "Opening" && "Tell them why you're writing! Share the reason for your letter. 💬"}
                {LETTER_SECTIONS[currentSection].name === "Body" && "Share your thoughts and feelings! Write what you want to tell them. 📝"}
                {LETTER_SECTIONS[currentSection].name === "Closing" && "End with warm wishes! Say something nice to finish. 💝"}
                {LETTER_SECTIONS[currentSection].name === "Signature" && "Sign your name! Add your name at the end. ✍️"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

