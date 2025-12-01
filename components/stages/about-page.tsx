"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

type Language = "en" | "zh"

const translations = {
  en: {
    title: "Dr. Yang Yin Nicole",
    subtitle: "Research Assistant Professor",
    description: "Dr. Yang Yin Nicole specializes in cognitive science, language education, and educational technology. Her research bridges AI, human cognition, and instructional design to enhance technology-enhanced learning.",
    degree: "Ph.D. in Education",
    university: "The Education University of Hong Kong",
    visionTitle: "Research Vision",
    visionText1: "We are committed to designing human-centered, AI-supported learning frameworks that integrate self-regulated learning and educational technology to improve the effectiveness and equity of language and interdisciplinary learning.",
    visionText2: "We examine AI's role in teaching as an inspiration and feedback tool that helps learners remain agentic, develop critical digital literacy, and adopt sustainable learning strategies.",
    teamTitle: "Research Team",
    team1Name: "Dr. Yang Yin Nicole",
    team1Desc: "Principal Investigator\nSpecializes in AI & educational technology",
    team2Name: "Mr. Liu Tong",
    team2Desc: "Research Team Member\nGraduate of AI & Educational Technology, EdUHK",
    marquee: "Research • Education • AI • Cognition • Learning Design",
  },
  zh: {
    title: "楊茵博士",
    subtitle: "研究助理教授",
    description: "楊茵博士專注於認知科學、語言教育同教育科技。佢嘅研究結合人工智能、人類認知同教學設計，以提升科技增強學習嘅效果。",
    degree: "教育學博士",
    university: "香港教育大學",
    visionTitle: "研究願景",
    visionText1: "我哋致力於設計以人為本、AI支援嘅學習框架，整合自主學習同教育科技，以提升語言同跨學科學習嘅效能同公平性。",
    visionText2: "我哋探討AI喺教學中作為啟發同回饋工具嘅角色，幫助學習者保持主動性，發展批判性數碼素養，並採用可持續嘅學習策略。",
    teamTitle: "研究團隊",
    team1Name: "楊茵博士",
    team1Desc: "首席研究員\n專注AI與教育科技",
    team2Name: "劉通先生",
    team2Desc: "研究團隊成員\n香港教育大學AI與教育科技畢業生",
    marquee: "研究 • 教育 • 人工智能 • 認知 • 學習設計",
  },
}

interface AboutPageProps {
  onBack?: () => void
}

export default function AboutPage({ onBack }: AboutPageProps) {
  const [language, setLanguage] = useState<Language>("en")
  const t = translations[language]

  useEffect(() => {
    // 从localStorage同步语言设置
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('siteLanguage') as Language | null
      // 兼容旧数据：将 "yue" 转换为 "zh"
      if (savedLang === 'yue') {
        setLanguage('zh')
        localStorage.setItem('siteLanguage', 'zh')
      } else if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
        setLanguage(savedLang)
      }
      
      // 监听Header的语言切换事件
      const handleLanguageChangeEvent = (e: Event) => {
        const customEvent = e as CustomEvent
        const newLang = customEvent.detail as Language
        // 兼容旧数据：将 "yue" 转换为 "zh"
        if (newLang === 'yue') {
          setLanguage('zh')
        } else if (newLang === 'en' || newLang === 'zh') {
          setLanguage(newLang)
        }
      }
      
      window.addEventListener('headerLanguageChange', handleLanguageChangeEvent)
      
      // 监听localStorage变化（跨标签页同步）
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'siteLanguage' && e.newValue) {
          const newLang = e.newValue as Language
          // 兼容旧数据：将 "yue" 转换为 "zh"
          if (newLang === 'yue') {
            setLanguage('zh')
            localStorage.setItem('siteLanguage', 'zh')
          } else if (newLang === 'en' || newLang === 'zh') {
            setLanguage(newLang)
          }
        }
      }
      
      window.addEventListener('storage', handleStorageChange)
      
      return () => {
        window.removeEventListener('headerLanguageChange', handleLanguageChangeEvent)
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 via-pink-50 to-orange-50 px-4" style={{ paddingTop: '100px', paddingBottom: '24px' }}>
      <div className="max-w-7xl mx-auto">
        {/* Hero / profile summary */}
        <header className="bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 py-12 border-b-2 border-purple-200 rounded-2xl mb-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="flex-shrink-0">
                <div className="relative w-56 h-56 rounded-2xl overflow-hidden border-4 border-purple-300 shadow-2xl">
                  <Image
                    src="http://museaiwrite.eduhk.hk/wp-content/uploads/2025/05/图片11.png"
                    alt={t.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <div className="text-lg text-gray-600 font-semibold mb-4">{t.subtitle}</div>
                <p className="text-base text-gray-700 leading-relaxed mb-6">{t.description}</p>
                
                <div className="mb-4">
                  <div className="bg-white/80 backdrop-blur-lg rounded-xl px-6 py-4 border-2 border-purple-200 shadow-lg inline-flex gap-4 items-center">
                    <span className="text-2xl">🎓</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-purple-700">{t.degree}</span>
                      <span className="text-sm text-gray-600">{t.university}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                  <a 
                    href="mailto:yyin@eduhk.hk" 
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <span>✉️</span> yyin@eduhk.hk
                  </a>
                  <a 
                    href="https://scholar.google.com/citations?user=bjITS38AAAAJ&hl=zh-CN&inst=9002373801639654337&oi=ao" 
                    target="_blank" 
                    rel="noopener"
                    className="px-6 py-3 bg-white hover:bg-purple-50 text-purple-700 border-2 border-purple-200 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <span>🎓</span> Google Scholar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Decorative marquee */}
        <div className="w-full overflow-hidden bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-orange-100/50 py-4 my-8 border-y-2 border-purple-200 rounded-xl">
          <div className="flex animate-marquee whitespace-nowrap">
            <div className="flex gap-4 items-center px-8 font-serif text-xl text-purple-700">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span className="ml-4">{t.marquee}</span>
            </div>
            <div className="flex gap-4 items-center px-8 font-serif text-xl text-purple-700" aria-hidden="true">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span className="ml-4">{t.marquee}</span>
            </div>
          </div>
        </div>

        {/* Vision-like band */}
        <section className="bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 text-white py-12 my-8 rounded-2xl mx-6 shadow-2xl">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-6">{t.visionTitle}</h2>
            <p className="text-lg leading-relaxed mb-4 text-purple-50">{t.visionText1}</p>
            <p className="text-lg leading-relaxed text-purple-50">{t.visionText2}</p>
          </div>
        </section>

        {/* Team */}
        <section className="py-12 bg-white/40 backdrop-blur-sm rounded-2xl">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-purple-700 border-b-4 border-purple-200 pb-4">
              {t.teamTitle}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border-4 border-purple-200 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-center">
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-400">
                  <Image
                    src="http://museaiwrite.eduhk.hk/wp-content/uploads/2025/05/图片11.png"
                    alt={t.team1Name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="font-bold text-xl text-purple-700 mb-3">{t.team1Name}</div>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">{t.team1Desc}</div>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border-4 border-purple-200 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-center">
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-400">
                  <Image
                    src="https://museaiwrite.eduhk.hk/wp-content/uploads/2025/10/image-8-683x1024.png"
                    alt={t.team2Name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="font-bold text-xl text-purple-700 mb-3">{t.team2Name}</div>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">{t.team2Desc}</div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-white py-8 mt-12 text-center rounded-2xl">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-purple-200">© 2025 MuseAIWrite - The Education University of Hong Kong</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

