"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import type { Language, StoryState } from "@/app/page"
import StageHeader from "@/components/stage-header"

interface GuidedWritingNoAiProps {
  language: Language
  storyState: StoryState
  onStoryWrite: (story: string) => void
  onBack: () => void
  userId?: string
}

// 增强的字数统计函数
const countWords = (text: string): number => {
  if (!text || !text.trim()) return 0
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const englishText = text.replace(/[\u4e00-\u9fff]/g, ' ').trim()
  const englishWords = englishText ? englishText.split(/\s+/).filter(word => word.length > 0).length : 0
  return chineseChars + englishWords
}

export default function GuidedWritingNoAi({ language, storyState, onStoryWrite, onBack, userId }: GuidedWritingNoAiProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [sectionTexts, setSectionTexts] = useState<Record<number, string>>({})

  const sections = storyState.structure?.outline || []
  const currentSectionText = sectionTexts[currentSection] || ""

  const wordCount = useMemo(() => {
    const allText = Object.values(sectionTexts).join(' ')
    return countWords(allText)
  }, [sectionTexts])

  const handleSectionTextChange = (sectionIndex: number, text: string) => {
    setSectionTexts(prev => ({
      ...prev,
      [sectionIndex]: text
    }))
  }

  const handlePublish = () => {
    // 检查是否有任何section包含"test"文本（跳过字数限制）
    const hasTestText = Object.values(sectionTexts).some(text => 
      text.toLowerCase().includes('test')
    )
    
    if (!hasTestText && wordCount < 50) {
      return
    }

    const fullStory = sections.map((_, index) => {
      const sectionText = sectionTexts[index] || ""
      return `${sections[index]}:\n${sectionText}`
    }).join('\n\n')

    // 不在这里保存，只在review阶段保存，避免重复
    // 故事会在story-review.tsx中保存

    onStoryWrite(fullStory)
  }

  const allSectionsFilled = sections.every((_, index) => sectionTexts[index] && sectionTexts[index].trim().length > 0)

  return (
    <div className="min-h-screen py-8 px-6 bg-gradient-to-br from-green-100 via-emerald-50 via-blue-50 via-purple-50 to-pink-50 relative" style={{ paddingTop: '100px' }}>
      <div className="max-w-6xl mx-auto">
        <StageHeader stage={4} title="Write Your Story" onBack={onBack} />

        <div className="grid lg:grid-cols-12 gap-6 mt-8">
          <div className="lg:col-span-8">
            <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl p-8 border-4 border-blue-300 shadow-2xl backdrop-blur-sm">
              <div className="mb-6">
                <label className="block text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  Story Sections
                </label>
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                  {sections.map((section, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSection(i)}
                      className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-lg transform hover:scale-105 ${
                        currentSection === i
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white scale-105 ring-4 ring-blue-300"
                          : sectionTexts[i]
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-green-400"
                          : "bg-white border-2 border-blue-200 hover:border-blue-300 text-blue-700"
                      }`}
                    >
                      {section}
                      {sectionTexts[i] && <span className="ml-2">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  placeholder={`Start writing the "${sections[currentSection]}" section here...`}
                  value={currentSectionText}
                  onChange={(e) => handleSectionTextChange(currentSection, e.target.value)}
                  className="w-full h-[500px] p-6 rounded-xl border-4 border-blue-300 focus:border-purple-400 bg-white/90 text-foreground placeholder-gray-400 font-serif text-base leading-relaxed shadow-inner focus:shadow-lg transition-all"
                  style={{ fontFamily: 'var(--font-comic-neue)' }}
                />
              </div>

              <div className="flex justify-between items-center mt-6 p-5 bg-gradient-to-r from-blue-50 via-cyan-50 to-purple-50 rounded-xl border-3 border-blue-300 shadow-lg">
                <div className="bg-white/80 px-4 py-2 rounded-lg border-2 border-blue-200">
                  <span className="text-lg font-bold text-blue-700">
                    📊 Words: {wordCount} / 50 minimum
                    {Object.values(sectionTexts).some(text => text.toLowerCase().includes('test')) && (
                      <span className="ml-2 text-green-600">✓ (test mode)</span>
                    )}
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePublish}
                disabled={(!Object.values(sectionTexts).some(text => text.toLowerCase().includes('test')) && wordCount < 50) || !allSectionsFilled}
                size="lg"
                className="w-full mt-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white border-0 shadow-2xl py-6 text-lg font-bold disabled:opacity-50"
              >
                Finish Story ({wordCount}/50 words)
              </Button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-3xl p-6 border-4 border-indigo-300 shadow-2xl">
              <h3 className="text-xl font-bold mb-5 text-indigo-700">Story Context</h3>
              <div className="space-y-4">
                <div className="bg-white/80 rounded-xl p-4 border-2 border-indigo-200">
                  <p className="text-gray-600 font-semibold mb-2">Character</p>
                  <p className="text-indigo-700 font-bold text-lg">{storyState.character?.name || "N/A"}</p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border-2 border-purple-200">
                  <p className="text-gray-600 font-semibold mb-2">Setting</p>
                  <p className="text-purple-700 font-bold text-lg">{storyState.plot?.setting || "N/A"}</p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border-2 border-pink-200">
                  <p className="text-gray-600 font-semibold mb-2">Structure</p>
                  <p className="text-pink-700 font-bold text-lg capitalize">{storyState.structure?.type || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

