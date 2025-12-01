"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Language } from "@/app/page"

interface AIMentorProps {
  stage: "character" | "plot" | "structure" | "writing"
  language: Language
}

type TipData = {
  en: { title: string; tips: string[] }
  zh: { title: string; tips: string[] }
}

const TIPS: Record<string, TipData> = {
  character: {
    en: {
      title: "Character Tips",
      tips: [
        "Give your character a unique name that sounds magical!",
        "Mix interesting traits to make your character special.",
        "Think about what makes your character different from others.",
        "Describe what your character looks like or what they like to do.",
      ],
    },
    zh: {
      title: "角色建议",
      tips: [
        "给你的角色取一个独特的、听起来像魔法的名字！",
        "混合有趣的特征来让你的角色特别。",
        "想想是什么让你的角色与众不同。",
        "描述一下你的角色长什么样子或喜欢做什么。",
      ],
    },
  },
  plot: {
    en: {
      title: "Plot Ideas",
      tips: [
        "Choose a setting that feels magical or exciting!",
        "Think about what challenge or problem your character must solve.",
        "Decide what your character wants to achieve by the end.",
        "Consider: Will it be a happy ending or a surprise twist?",
      ],
    },
    zh: {
      title: "故事情节建议",
      tips: [
        "选择一个感觉神奇或令人兴奋的场景！",
        "想想你的角色必须解决什么挑战或问题。",
        "决定你的角色最后想要实现什么。",
        "考虑：结局是否会是幸福的或有惊喜的转折？",
      ],
    },
  },
  structure: {
    en: {
      title: "Story Structure Guide",
      tips: [
        "Classic stories have a clear beginning, middle, and end.",
        "Mystery stories need clues that lead to a big reveal!",
        "Adventure stories are about journeys and challenges.",
        "Magic stories bring wonder and special powers into your world.",
      ],
    },
    zh: {
      title: "故事结构指南",
      tips: [
        "经典故事有清晰的开始、中间和结尾。",
        "神秘故事需要线索来指向大揭露！",
        "冒险故事是关于旅程和挑战的。",
        "魔法故事将奇迹和特殊力量带入你的世界。",
      ],
    },
  },
  writing: {
    en: {
      title: "Writing Tips",
      tips: [
        "Describe what characters see, hear, smell, and feel!",
        "Use dialogue to show what characters are thinking.",
        "Build excitement by making challenges harder.",
        "Remember: every word can bring your story to life!",
      ],
    },
    zh: {
      title: "写作建议",
      tips: [
        "描述角色看到、听到、闻到和感受到的东西！",
        "通过对话展示角色的想法。",
        "通过让挑战更困难来建立兴奋感。",
        "记住：每个词都可以让你的故事栩栩如生！",
      ],
    },
  },
}

export default function AIMentor({ stage, language }: AIMentorProps) {
  const [displayedTip, setDisplayedTip] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    setDisplayedTip(0)
    setIsVisible(true)
  }, [stage, language])

  const tips = TIPS[stage]
  const currentTips = tips[language].tips
  const title = tips[language].title

  const handleNextTip = () => {
    setDisplayedTip((prev) => (prev + 1) % currentTips.length)
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border-2 border-primary/30 animate-pulse-glow">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-3xl">🎭</div>
          <div>
            <h3 className="font-bold text-lg text-primary mb-1">{title}</h3>
            <div className="inline-block px-2 py-1 bg-primary/20 rounded text-xs font-medium text-primary">
              AI Mentor
            </div>
          </div>
        </div>

        {isVisible && (
          <div className="space-y-4">
            <p className="text-foreground font-medium leading-relaxed">{currentTips[displayedTip]}</p>

            <div className="flex gap-2">
              <Button onClick={handleNextTip} variant="outline" size="sm" className="flex-1 bg-transparent">
                Next Tip
              </Button>
              <Button onClick={() => setIsVisible(!isVisible)} variant="ghost" size="sm" className="px-3">
                {isVisible ? "Hide" : "Show"}
              </Button>
            </div>

            <div className="flex gap-1 justify-center">
              {currentTips.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === displayedTip ? "bg-primary w-4" : "bg-border w-1"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
