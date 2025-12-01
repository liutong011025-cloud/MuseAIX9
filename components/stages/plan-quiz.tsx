"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Language } from "@/app/page"

interface PlanQuizProps {
  language?: Language
  onComplete?: (recommendation: {
    type: "Story" | "Book Review" | "Letter"
    goal: string
    tips: string[]
    startPrompt: string
    skills?: string[]
    length?: string
    structure?: string[]
  }) => void
  onBack?: () => void
  onSkipToSelection?: () => void
}

interface Question {
  id: number
  question: string
  options: {
    label: string
    text: string
    hint: "Letter" | "Book Review" | "Story"
    goal?: string
    skill?: string
  }[]
}

const getQuestions = (language: Language = "en"): Question[] => {
  const translations = {
    en: {
      q1: "Which thing sounds most fun to write about?",
      q1a: "Telling a friend what happened today (I like sharing real things).",
      q1b: "Saying if a book was awesome or boring and why (I like giving opinions).",
      q1c: "Making up a magical adventure with cool characters (I love imagining).",
      q2: "Who would you rather write for?",
      q2a: "A friend, parent, or teacher (someone I know).",
      q2b: "Kids who might read a book I liked (people who want advice).",
      q2c: "Anyone who loves adventures or surprises (an audience for my tale).",
      q3: "What do you want to get better at when writing?",
      q3a: "Saying how I feel and being friendly (write like a buddy).",
      q3b: "Explaining why something is good or not with examples (give reasons).",
      q3c: "Making plots, characters and surprises (build a whole world).",
      q4: "How long would you like your piece to be?",
      q4a: "Short and sweet — just a few paragraphs (fast to finish).",
      q4b: "A bit longer but focused — telling why I liked a book (clear parts).",
      q4c: "Longer with scenes and maybe chapter ideas (big imagination).",
      q5: "Pick a prompt that sounds best:",
      q5a: "\"Hi! Guess what I did today?\"",
      q5b: "\"This book is great because…\"",
      q5c: "\"Once upon a time, a dragon lost its color…\"",
    },
    zh: {
      q1: "邊樣嘢聽起來最有趣去寫？",
      q1a: "告訴朋友今日發生咗咩（我鍾意分享真實嘅事）。",
      q1b: "講一本書係好棒定係無聊同點解（我鍾意發表意見）。",
      q1c: "編造一個有酷角色嘅魔法冒險（我鍾意想像）。",
      q2: "你更想為邊個寫？",
      q2a: "朋友、父母或老師（我認識嘅人）。",
      q2b: "可能會讀我鍾意嘅書嘅小朋友（想要建議嘅人）。",
      q2c: "任何鍾意冒險或驚喜嘅人（我故事嘅觀眾）。",
      q3: "寫作時你想喺邊方面變得更好？",
      q3a: "表達我嘅感受同保持友好（像朋友一樣寫）。",
      q3b: "用例子解釋點解某樣嘢好或唔好（提供理由）。",
      q3c: "創造情節、角色同驚喜（建立整個世界）。",
      q4: "你想你嘅作品有幾長？",
      q4a: "簡短而甜蜜——只係幾段（快速完成）。",
      q4b: "稍長但集中——講點解我鍾意一本書（清晰部分）。",
      q4c: "更長，有場景同可能嘅章節想法（大想像力）。",
      q5: "選擇聽起來最好嘅提示：",
      q5a: "\"你好！猜猜我今日做咗咩？\"",
      q5b: "\"呢本書好棒因為…\"",
      q5c: "\"從前，一條龍失去咗佢嘅顏色…\"",
    },
  }
  
  const t = translations[language] || translations.en
  
  return [
    {
      id: 1,
      question: t.q1,
      options: [
        {
          label: "A",
          text: t.q1a,
          hint: "Letter",
          goal: "practice clear expression and friendly tone"
        },
        {
          label: "B",
          text: t.q1b,
          hint: "Book Review",
          goal: "practice opinion and reasons"
        },
        {
          label: "C",
          text: t.q1c,
          hint: "Story",
          goal: "practice imagination and plotting"
        }
      ]
    },
    {
      id: 2,
      question: t.q2,
      options: [
        {
          label: "A",
          text: t.q2a,
          hint: "Letter"
        },
        {
          label: "B",
          text: t.q2b,
          hint: "Book Review"
        },
        {
          label: "C",
          text: t.q2c,
          hint: "Story"
        }
      ]
    },
    {
      id: 3,
      question: t.q3,
      options: [
        {
          label: "A",
          text: t.q3a,
          hint: "Letter",
          skill: "tone and emotions"
        },
        {
          label: "B",
          text: t.q3b,
          hint: "Book Review",
          skill: "opinion + evidence"
        },
        {
          label: "C",
          text: t.q3c,
          hint: "Story",
          skill: "creativity and structure"
        }
      ]
    },
    {
      id: 4,
      question: t.q4,
      options: [
        {
          label: "A",
          text: t.q4a,
          hint: "Letter"
        },
        {
          label: "B",
          text: t.q4b,
          hint: "Book Review"
        },
        {
          label: "C",
          text: t.q4c,
          hint: "Story"
        }
      ]
    },
    {
      id: 5,
      question: t.q5,
      options: [
        {
          label: "A",
          text: t.q5a,
          hint: "Letter"
        },
        {
          label: "B",
          text: t.q5b,
          hint: "Book Review"
        },
        {
          label: "C",
          text: t.q5c,
          hint: "Story"
        }
      ]
    }
  ]
}

const getRecommendations = (language: Language = "en") => {
  const translations = {
    en: {
      storyGoal: "Practice imagination, character building and plot.",
      storyTips: [
        "Start with a strong opening line (e.g., \"The day the rain talked, everything changed…\").",
        "Make a main character and one problem they must solve.",
        "Write 3 short scenes: beginning, middle, end."
      ],
      storyPrompt: "Once upon a time, a small cat found a glowing map…",
      bookGoal: "Practice giving opinions with reasons and examples.",
      bookTips: [
        "Start by saying if you liked the book and why.",
        "Give 2-3 examples from the book to support your opinion.",
        "End with who you think would enjoy this book."
      ],
      bookPrompt: "This book is great because…",
      letterGoal: "Practice clear feelings and friendly tone.",
      letterTips: [
        "Start with a friendly greeting.",
        "Share what happened and how you felt about it.",
        "End with a question or wish for the person."
      ],
      letterPrompt: "Hi! Guess what I did today?",
    },
    zh: {
      storyGoal: "練習想像力、角色塑造同情節。",
      storyTips: [
        "用強有力嘅開場白開始（例如，「雨說話嘅那天，一切都改變了…」）。",
        "創造一個主要角色同一個佢必須解決嘅問題。",
        "寫3個短場景：開始、中間、結尾。"
      ],
      storyPrompt: "從前，一隻小貓發現了一張發光嘅地圖…",
      bookGoal: "練習用理由同例子發表意見。",
      bookTips: [
        "先講你係咪鍾意呢本書同點解。",
        "從書中提供2-3個例子支持你嘅意見。",
        "以你認為邊個會鍾意呢本書結束。"
      ],
      bookPrompt: "呢本書好棒因為…",
      letterGoal: "練習清晰感受同友好語氣。",
      letterTips: [
        "用友好問候開始。",
        "分享發生咗咩同你對佢嘅感受。",
        "以對該人嘅問題或願望結束。"
      ],
      letterPrompt: "你好！猜猜我今日做咗咩？",
    },
  }
  
  const t = translations[language] || translations.en
  
  return {
    "Story": {
      goal: t.storyGoal,
      tips: t.storyTips,
      startPrompt: t.storyPrompt
    },
    "Book Review": {
      goal: t.bookGoal,
      tips: t.bookTips,
      startPrompt: t.bookPrompt
    },
    "Letter": {
      goal: t.letterGoal,
      tips: t.letterTips,
      startPrompt: t.letterPrompt
    }
  }
}

const uiTranslations = {
  en: {
    title: "Start with a Plan",
    subtitle: "Let's find the perfect writing type for you!",
    back: "← Back",
    questionOf: "Question",
    of: "of",
    orWrite: "Or you just want to write...",
    shortLength: "Short and sweet — just a few paragraphs",
    mediumLength: "A bit longer but focused — clear parts",
    longLength: "Longer with scenes and maybe chapter ideas",
    storyStructure: ["Beginning: Introduce your character and setting", "Middle: Show the problem or adventure", "End: Solve the problem or complete the adventure"],
    bookStructure: ["Introduction: What book and your overall opinion", "Body: Reasons and examples from the book", "Conclusion: Who would enjoy this book"],
    letterStructure: ["Greeting: Say hello to your reader", "Body: Share what happened and how you felt", "Closing: Ask a question or send wishes"],
  },
  zh: {
    title: "開始制定計劃",
    subtitle: "讓我哋為你找到完美嘅寫作類型！",
    back: "← 返回",
    questionOf: "問題",
    of: "共",
    orWrite: "或者你只係想寫...",
    shortLength: "簡短而甜蜜——只係幾段",
    mediumLength: "稍長但集中——清晰部分",
    longLength: "更長，有場景同可能嘅章節想法",
    storyStructure: ["開始：介紹你嘅角色同設定", "中間：展示問題或冒險", "結尾：解決問題或完成冒險"],
    bookStructure: ["介紹：邊本書同你嘅整體意見", "正文：書中嘅理由同例子", "結論：邊個會鍾意呢本書"],
    letterStructure: ["問候：向讀者問好", "正文：分享發生咗咩同你嘅感受", "結尾：問問題或送上祝福"],
  },
}

export default function PlanQuiz({ language = "en", onComplete, onBack, onSkipToSelection }: PlanQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const questions = getQuestions(language)
  const recommendations = getRecommendations(language)
  const t = uiTranslations[language] || uiTranslations.en

  const handleAnswer = (hint: "Letter" | "Book Review" | "Story") => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: hint }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // 计算推荐
      const scores = { Letter: 0, "Book Review": 0, Story: 0 }
      
      Object.values(newAnswers).forEach((answer) => {
        if (answer === "Letter") scores.Letter++
        else if (answer === "Book Review") scores["Book Review"]++
        else if (answer === "Story") scores.Story++
      })

      // 找到最高分
      const maxScore = Math.max(scores.Letter, scores["Book Review"], scores.Story)
      let recommendedType: "Story" | "Book Review" | "Letter" = "Story"
      
      if (scores.Story === maxScore) {
        recommendedType = "Story"
      } else if (scores["Book Review"] === maxScore) {
        recommendedType = "Book Review"
      } else if (scores.Letter === maxScore) {
        recommendedType = "Letter"
      }

      // 获取目标（从第3题）
      const question3Answer = newAnswers[3]
      let goal = recommendations[recommendedType].goal
      let skills: string[] = []
      if (question3Answer) {
        const q3Option = questions[2].options.find(opt => opt.hint === question3Answer)
        if (q3Option?.goal) {
          goal = `Practice ${q3Option.goal}.`
        } else if (q3Option?.skill) {
          goal = `Practice ${q3Option.skill}.`
          skills = [q3Option.skill]
        }
      }

      // 获取长度建议（从第4题）
      const question4Answer = newAnswers[4]
      let length = ""
      if (question4Answer) {
        const q4Option = questions[3].options.find(opt => opt.hint === question4Answer)
        if (q4Option?.text.includes("Short") || q4Option?.text.includes("簡短")) {
          length = t.shortLength
        } else if (q4Option?.text.includes("bit longer") || q4Option?.text.includes("稍長")) {
          length = t.mediumLength
        } else if (q4Option?.text.includes("Longer") || q4Option?.text.includes("更長")) {
          length = t.longLength
        }
      }

      // 根据类型生成结构建议
      let structure: string[] = []
      if (recommendedType === "Story") {
        structure = t.storyStructure
      } else if (recommendedType === "Book Review") {
        structure = t.bookStructure
      } else if (recommendedType === "Letter") {
        structure = t.letterStructure
      }

      onComplete?.({
        type: recommendedType,
        goal,
        tips: recommendations[recommendedType].tips,
        startPrompt: recommendations[recommendedType].startPrompt,
        skills: skills.length > 0 ? skills : undefined,
        length: length || undefined,
        structure
      })
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 via-orange-50 to-yellow-50">
      {/* 装饰性背景元素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-20 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '4s' }}></div>
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
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* 进度条 */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {t.questionOf} {currentQuestion + 1} {t.of} {questions.length}
          </p>
        </div>

        {/* 问题卡片 */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 md:p-10 border-2 border-purple-200 shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
              {question.question}
            </h2>

            <div className="space-y-4">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.hint)}
                  className="w-full text-left bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 hover:from-purple-100 hover:via-pink-100 hover:to-orange-100 border-2 border-purple-200 hover:border-purple-400 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                      {option.label}
                    </div>
                    <p className="flex-1 text-lg md:text-xl text-gray-700 font-medium leading-relaxed">
                      {option.text}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 或者你想写？按钮 */}
          {onSkipToSelection && (
            <div className="max-w-3xl mx-auto mt-8 text-center">
              <Button
                onClick={onSkipToSelection}
                variant="outline"
                size="lg"
                className="bg-white/80 backdrop-blur-lg border-2 border-purple-300 hover:bg-purple-50 text-purple-700 shadow-lg font-bold py-4 px-8 text-lg md:text-xl rounded-full hover:scale-105 transition-all duration-300"
              >
                {t.orWrite}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

