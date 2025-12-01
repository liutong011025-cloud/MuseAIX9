"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import StageHeader from "@/components/stage-header"
import { Mail, Copy, Download, Send, CheckCircle2, Sparkles, Loader2 } from "lucide-react"

interface LetterCompleteProps {
  recipient: string
  occasion: string
  letter: string
  guidance?: string | null
  readerImageUrl?: string | null
  sections?: string[]
  onReset: () => void
  onBack: () => void
  userId?: string
  workId?: string | null // 如果提供，表示正在编辑已保存的作品
}

export default function LetterComplete({
  recipient,
  occasion,
  letter,
  guidance,
  readerImageUrl,
  sections,
  onReset,
  onBack,
  onEdit,
  userId,
  workId,
}: LetterCompleteProps) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const hasSavedRef = useRef(false)
  const savedLetterRef = useRef<string>("")

  // 保存信件内容到interactions API
  useEffect(() => {
    if (letter && userId && (!hasSavedRef.current || savedLetterRef.current !== letter)) {
      hasSavedRef.current = true
      savedLetterRef.current = letter
      
      fetch("/api/interactions", {
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
            letter,
            guidance: guidance || null,
            readerImageUrl: readerImageUrl || null,
          },
          letter, // 保存完整信件内容
          recipient,
          occasion,
          guidance: guidance || null,
          readerImageUrl: readerImageUrl || null,
          workId: workId || undefined, // 如果正在编辑，传递 workId
        }),
      })
      .then(res => res.json())
      .then(data => {
        console.log('Letter saved successfully:', data)
        if (data.success) {
          console.log('Letter saved to database')
        }
      })
      .catch((error) => {
        console.error("Error saving letter to interactions:", error)
        hasSavedRef.current = false
      })
    }
  }, [letter, userId, recipient, occasion])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letter)
      setCopied(true)
      toast.success("Letter copied to clipboard! 📋✨")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy letter")
    }
  }

  const handleDownload = () => {
    const content = `
LETTER TO: ${recipient}
OCCASION: ${occasion}

---

${letter}

---

Created with MuseAIWrite
    `.trim()

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `letter-to-${recipient.replace(/\s+/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Letter downloaded! 📥")
  }

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address! 📧")
      return
    }

    // 简单的邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address! 📧")
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/send-letter-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          recipient,
          occasion,
          letter,
          user_id: userId || "student",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setEmailSent(true)
        toast.success("Letter sent successfully! 📧✨")
      } else {
        toast.error(data.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error("Failed to send email. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10" style={{ paddingTop: '80px' }}>
        <StageHeader onBack={onBack} />

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center items-center gap-4">
            <CheckCircle2 className="w-16 h-16 text-green-600 animate-scale-in" />
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
              🎉 Your Letter is Complete! 🎉
            </h1>
            <Sparkles className="w-16 h-16 text-purple-600 animate-pulse" />
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-xl px-6 py-3 inline-block border-2 border-pink-200 shadow-lg">
            <p className="text-lg text-gray-700">
              To: <span className="font-bold text-pink-700">{recipient}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              💭 {occasion}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* 左侧：信件展示 */}
          <div className="lg:col-span-8">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 border-4 border-pink-300 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-8 h-8 text-pink-600" />
                <h2 className="text-3xl font-bold text-pink-700">Your Letter</h2>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-xl p-8 border-2 border-amber-200 shadow-inner relative overflow-hidden">
                <div 
                  className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap"
                  style={{ 
                    fontFamily: 'Patrick Hand, Kalam, cursive',
                  }}
                >
                  {letter.split('').map((char, index) => (
                    <span
                      key={index}
                      className="animate-handwriting"
                      style={{
                        animationDelay: `${index * 0.08}s`,
                        display: 'inline-block',
                      }}
                    >
                      {char === '\n' ? <br /> : char}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="lg:col-span-4 space-y-6">
            {/* 操作按钮 */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border-4 border-purple-300 shadow-xl">
              <h3 className="text-xl font-bold text-purple-700 mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={handleCopy}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg py-3 text-lg font-bold rounded-xl hover:scale-105 transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Copied! 🎉
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copy Letter
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full bg-white/80 backdrop-blur-lg border-2 border-gray-300 hover:bg-gray-50 text-gray-700 shadow-lg font-bold py-3 text-lg rounded-xl hover:scale-105 transition-all"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Letter
                </Button>
                
                {onEdit && (
                  <Button
                    onClick={onEdit}
                    variant="outline"
                    className="w-full bg-white/80 backdrop-blur-lg border-2 border-purple-300 hover:bg-purple-50 text-purple-700 shadow-lg font-bold py-3 text-lg rounded-xl hover:scale-105 transition-all"
                  >
                    <span className="text-xl mr-2">✏️</span>
                    Edit Letter
                  </Button>
                )}
              </div>
            </div>

            {/* 发邮件功能 */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border-4 border-green-300 shadow-xl">
              <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6" />
                Send by Email
              </h3>
              
              {emailSent ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-green-700 font-bold">Email sent successfully! 📧✨</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      Recipient's Email
                    </label>
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-3 border-2 border-green-200 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-300"
                      disabled={isSending}
                    />
                  </div>
                  <Button
                    onClick={handleSendEmail}
                    disabled={isSending || !email.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg py-3 text-lg font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Letter
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* 重置按钮 */}
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full bg-white/80 backdrop-blur-lg border-2 border-gray-300 hover:bg-gray-50 text-gray-700 shadow-lg font-bold py-3 text-lg rounded-xl hover:scale-105 transition-all"
            >
              ✨ Write Another Letter
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

