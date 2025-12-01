"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import StageHeader from "@/components/stage-header"
import { Mail, Sparkles, Heart, Star, CheckCircle2 } from "lucide-react"

interface LetterCelebrationProps {
  recipient: string
  occasion: string
  letter: string
  onReset: () => void
  onBack: () => void
  userId?: string
}

export default function LetterCelebration({
  recipient,
  occasion,
  letter,
  onReset,
  onBack,
  userId
}: LetterCelebrationProps) {
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

  const handleCopy = () => {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    toast.success("Letter copied! 📋✨")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen py-6 px-4 bg-gradient-to-br from-pink-100 via-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* 庆祝背景效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {showConfetti && [...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              fontSize: `${Math.random() * 20 + 15}px`
            }}
          >
            {['🎉', '✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10" style={{ paddingTop: '80px' }}>
        <StageHeader onBack={onBack} />

        {/* 庆祝标题 */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center items-center gap-4">
            <CheckCircle2 className="w-16 h-16 text-green-600 animate-scale-in" />
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              🎉 Amazing! 🎉
            </h1>
            <Sparkles className="w-16 h-16 text-purple-600 animate-pulse" />
          </div>
          <p className="text-2xl text-gray-700 mb-4">
            Your letter is complete! ✨
          </p>
          <div className="bg-white/80 backdrop-blur-lg rounded-xl px-6 py-3 inline-block border-2 border-pink-200 shadow-lg">
            <p className="text-lg text-gray-700">
              To: <span className="font-bold text-pink-700">{recipient}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              💭 {occasion}
            </p>
          </div>
        </div>

        {/* 信件展示 */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 border-4 border-pink-300 shadow-2xl mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-8 h-8 text-pink-600" />
            <h2 className="text-3xl font-bold text-pink-700">Your Letter</h2>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-xl p-8 border-2 border-amber-200 shadow-inner">
            <pre className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap font-serif">
              {letter}
            </pre>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Button
            onClick={handleCopy}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg py-3 px-8 text-lg font-bold rounded-xl hover:scale-105 transition-all"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Copied! 🎉
              </>
            ) : (
              <>
                📋 Copy Letter
              </>
            )}
          </Button>
          
          <Button
            onClick={onReset}
            variant="outline"
            className="bg-white/80 backdrop-blur-lg border-2 border-gray-300 hover:bg-gray-50 text-gray-700 shadow-lg font-bold py-3 px-8 text-lg rounded-xl hover:scale-105 transition-all"
          >
            ✨ Write Another Letter
          </Button>
        </div>

        {/* 成就卡片 */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏆</div>
            <div>
              <h3 className="text-xl font-bold text-yellow-800 mb-2">You Did It! 🎊</h3>
              <p className="text-yellow-700">
                You wrote an amazing letter! Keep practicing and you'll become an even better writer! ✨
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


