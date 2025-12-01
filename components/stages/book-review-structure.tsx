"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface BookReviewStructureProps {
  reviewType: "recommendation" | "critical" | "literary"
  bookTitle: string
  onStructureSelect: (structure: {
    type: "recommendation" | "critical" | "literary"
    outline: string[]
  }) => void
  onBack: () => void
  userId?: string
}

// 三种review类型对应的三种结构
const STRUCTURES_BY_TYPE = {
  recommendation: [
    {
      type: "recommendation" as const,
      name: "Introduction-Recommendation Structure",
      desc: "Introduce the book, share what you love, and recommend it to others",
      outline: ["Introduction", "What I Loved", "Recommendation"],
    },
    {
      type: "recommendation" as const,
      name: "Detailed Recommendation Structure",
      desc: "A comprehensive recommendation with detailed sections",
      outline: ["Book Introduction", "Characters & Plot", "What Makes It Special", "Who Should Read It", "Final Recommendation"],
    },
    {
      type: "recommendation" as const,
      name: "Simple Recommendation Structure",
      desc: "A straightforward recommendation format",
      outline: ["Book Overview", "My Favorite Parts", "Why I Recommend It"],
    },
  ],
  critical: [
    {
      type: "critical" as const,
      name: "Balanced Critical Structure",
      desc: "Analyze both strengths and weaknesses fairly",
      outline: ["Introduction", "Strengths", "Weaknesses", "Conclusion"],
    },
    {
      type: "critical" as const,
      name: "In-Depth Critical Analysis",
      desc: "A thorough critical examination",
      outline: ["Book Overview", "What Worked Well", "What Didn't Work", "Specific Examples", "Overall Assessment"],
    },
    {
      type: "critical" as const,
      name: "Thematic Critical Review",
      desc: "Focus on themes and deeper analysis",
      outline: ["Themes & Messages", "Character Analysis", "Writing Style", "Final Thoughts"],
    },
  ],
  literary: [
    {
      type: "literary" as const,
      name: "Literary Analysis Structure",
      desc: "Explore deeper meanings and literary techniques",
      outline: ["Introduction", "Themes & Symbols", "Writing Style", "Conclusion"],
    },
    {
      type: "literary" as const,
      name: "Comprehensive Literary Review",
      desc: "An extensive literary examination",
      outline: ["Book Context", "Themes & Motifs", "Character Development", "Literary Devices", "Author's Message", "Personal Reflection"],
    },
    {
      type: "literary" as const,
      name: "Focused Literary Review",
      desc: "Concentrated analysis on key aspects",
      outline: ["Main Themes", "Symbolism", "Character Analysis", "Literary Merit"],
    },
  ],
}

export default function BookReviewStructure({ reviewType, bookTitle, onStructureSelect, onBack, userId }: BookReviewStructureProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [examples, setExamples] = useState<Array<{ structure_type: string; story: string; imageUrl: string }>>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const structures = STRUCTURES_BY_TYPE[reviewType]

  const handleSeeStructures = async () => {
    setShowOptions(true)
    setIsGenerating(true)
    
    try {
      // TODO: 调用API生成示例（类似story-structure的逻辑）
      // 暂时使用空数组
      setExamples([])
      setIsGenerating(false)
    } catch (error) {
      console.error("Error generating examples:", error)
      toast.error("Failed to generate examples")
      setIsGenerating(false)
    }
  }

  const handleSelect = (index: number) => {
    setSelected(index)
    const structure = structures[index]
    onStructureSelect({
      type: structure.type,
      outline: structure.outline,
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
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
              ← Back
            </Button>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Choose Review Structure
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Reviewing: <strong>{bookTitle}</strong>
            </p>
          </div>

          {!showOptions ? (
            <div className="text-center">
              <Button
                onClick={handleSeeStructures}
                size="lg"
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white border-0 shadow-2xl py-6 px-12 text-xl md:text-2xl font-bold hover:scale-105 transition-all duration-300 rounded-full"
              >
                See Structures in Detail
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {isGenerating && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
                  <p className="text-lg text-gray-600">Generating example reviews with AI images...</p>
                </div>
              )}

              {!isGenerating && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {structures.map((structure, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelect(index)}
                      className={`relative bg-white/95 backdrop-blur-lg rounded-3xl p-8 border-2 transition-all duration-300 cursor-pointer ${
                        selected === index
                          ? 'border-purple-500 shadow-2xl scale-105'
                          : 'border-purple-200 shadow-lg hover:shadow-xl hover:scale-102'
                      }`}
                    >
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">{structure.name}</h3>
                      <p className="text-gray-600 mb-6">{structure.desc}</p>
                      <div className="space-y-2">
                        {structure.outline.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center gap-2 text-gray-700">
                            <span className="text-purple-600 font-bold">{stepIndex + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                      {selected === index && (
                        <div className="mt-6 text-center">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          >
                            Selected ✓
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

