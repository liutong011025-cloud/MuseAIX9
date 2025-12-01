"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Language, StoryState } from "@/app/page"
import StageHeader from "@/components/stage-header"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface StoryStructureProps {
  language: Language
  plot: StoryState["plot"] | null
  character: StoryState["character"] | null
  onStructureSelect: (structure: StoryState["structure"]) => void
  onBack: () => void
  userId?: string
}

interface StoryExample {
  structure_type: string
  story: string
  imageUrl: string
}

const STRUCTURES = [
  {
    type: "freytag" as const,
    name: "Freytag's Pyramid",
    desc: "A classic five-act structure with exposition, rising action, climax, falling action, and resolution",
    outline: ["Exposition", "Rising Action", "Climax", "Falling Action", "Resolution"],
  },
  {
    type: "threeAct" as const,
    name: "Three Act Structure",
    desc: "A simple three-part story: setup, confrontation, and resolution",
    outline: ["Setup", "Confrontation", "Resolution"],
  },
  {
    type: "fichtean" as const,
    name: "Fichtean Curve",
    desc: "Multiple crises building tension toward a final climax",
    outline: ["First Crisis", "Second Crisis", "Third Crisis", "Climax", "Resolution"],
  },
]

export default function StoryStructure({ language, plot, character, onStructureSelect, onBack, userId }: StoryStructureProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [examples, setExamples] = useState<StoryExample[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPage, setCurrentPage] = useState(0) // 当前页码，0表示第一个结构
  const [isPageFlipping, setIsPageFlipping] = useState(false) // 翻页动画状态
  const [currentAction, setCurrentAction] = useState<string>("")
  const [selectedStructureImage, setSelectedStructureImage] = useState<string>("") // 保存选中的结构图片
  const [museMessage, setMuseMessage] = useState<string>("") // Muse 的提示消息

  useEffect(() => {
    if (showOptions && examples.length === 0) {
      generateExamples()
    }
  }, [showOptions])

  // 页面切换时触发翻页动画
  useEffect(() => {
    if (showOptions && !isGenerating) {
      setIsPageFlipping(true)
      const timer = setTimeout(() => {
        setIsPageFlipping(false)
      }, 600) // 动画持续时间
      return () => clearTimeout(timer)
    }
  }, [currentPage, showOptions, isGenerating])

  const generateExamples = async () => {
    setIsGenerating(true)
    setMuseMessage("Generating example stories with AI images...")
    
    // 并行调用 Muse API 获取提示（不阻塞主流程）
    fetch("/api/dify-progress-mentor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "Generating example stories with AI images",
        stage: "structure",
        context: {
          currentPage,
          examplesGenerated: false,
          plot,
          character: character?.name,
        },
        user_id: userId || "default-user",
      }),
    })
      .then((museResponse) => {
        if (museResponse.ok) {
          return museResponse.json()
        }
        return null
      })
      .then((museData) => {
        if (museData?.message) {
          setMuseMessage(museData.message)
        }
      })
      .catch((museError) => {
        console.error("Error fetching Muse message:", museError)
        // 如果 Muse API 失败，保持默认消息
      })
    
    try {
      // 一次性生成所有三个结构的故事
      const response = await fetch("/api/dify-structure-examples", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          character: character,
          plot: plot,
          user_id: userId || "default-user",
          generate_all: true, // 标志：一次性生成所有故事
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // 解析返回的三个故事
      const generatedExamples: StoryExample[] = []
      
      // 为每个结构生成图片并组合结果
      const structuresToProcess = [
        { type: 'freytag', storyData: data.freytag },
        { type: 'threeAct', storyData: data.threeAct },
        { type: 'fichtean', storyData: data.fichtean },
      ]

      for (const { type, storyData } of structuresToProcess) {
        // 生成图片（使用现有的图片生成逻辑）
        let imageUrl = ''
        try {
          // 构建图片提示词，包含物种信息
          const speciesInfo = character?.species 
            ? (character.species === "Boy" || character.species === "Girl" 
              ? `a young ${character.species.toLowerCase()}` 
              : `a ${character.species.toLowerCase()}`)
            : 'a character'
          const imagePrompt = `A charming illustration for a children's story: ${speciesInfo} named ${character?.name || 'a character'} in ${plot?.setting || 'a setting'}, ${plot?.conflict || 'facing a challenge'}. Colorful, friendly, and suitable for children.`
          
          const imageResponse = await fetch("/api/generate-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              prompt: imagePrompt,
              aspect_ratio: "16:9",
              user_id: userId,
              stage: 'structure'
            }),
          })

          if (imageResponse.ok) {
            const imageData = await imageResponse.json()
            imageUrl = imageData.imageUrl || ''
          }
        } catch (imageError) {
          console.error('Error generating image:', imageError)
        }

        // 如果没有图片，使用占位符
        if (!imageUrl) {
          imageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${type}`
        }

        generatedExamples.push({
          structure_type: type,
          story: storyData?.story || "Example story",
          imageUrl: imageUrl,
        })
      }

      setExamples(generatedExamples)
      toast.success("Example stories generated!")
    } catch (error) {
      console.error("Error generating examples:", error)
      toast.error("Failed to generate examples")
      
      // 如果失败，使用默认故事
      const defaultExamples = STRUCTURES.map((structure) => ({
        structure_type: structure.type,
        story: `Once upon a time, ${character?.name || 'a hero'} lived in ${plot?.setting || 'a magical place'}. They faced ${plot?.conflict || 'a challenge'} and worked hard to ${plot?.goal || 'achieve their goal'}. In the end, they succeeded and learned an important lesson.`,
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${structure.type}`,
      }))
      setExamples(defaultExamples)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelect = (structureType: string) => {
    const structure = STRUCTURES.find((s) => s.type === structureType)
    if (structure) {
      setCurrentAction(`Selected structure: ${structure.name}`)
      // 保存当前选中结构的图片
      const example = examples.find((e) => e.structure_type === structureType)
      if (example?.imageUrl) {
        setSelectedStructureImage(example.imageUrl)
      }
      onStructureSelect({
        type: structure.type as any,
        outline: structure.outline,
        imageUrl: example?.imageUrl || "",
      })
    }
  }

  // 监听翻页
  useEffect(() => {
    if (showOptions && !isGenerating) {
      const structure = STRUCTURES[currentPage]
      setCurrentAction(`Viewing structure: ${structure.name}`)
    }
  }, [currentPage, showOptions, isGenerating])

  return (
    <div className="min-h-screen py-8 px-6 bg-gradient-to-br from-indigo-100 via-purple-50 via-pink-50 to-orange-50 relative" style={{ paddingTop: '100px' }}>
      <div className="max-w-[95%] xl:max-w-[1400px] mx-auto">
        <StageHeader stage={3} title="Choose Story Structure" onBack={onBack} />

        <div className="mt-8">
          {!showOptions ? (
            <div className="w-full">
              <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-3xl p-10 border-4 border-purple-300 shadow-2xl backdrop-blur-sm">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4" style={{ fontFamily: 'var(--font-patrick-hand)' }}>
                      Story Structure Guide
                    </h3>
                    <p className="text-gray-700 text-xl mb-8 font-medium leading-relaxed" style={{ fontFamily: 'var(--font-comic-neue)' }}>
                      Now that we have your character and plot, let's choose how to structure your story! Different structures create different feelings. Let me show you three powerful ways to tell your story:
                    </p>
                  </div>

                  <div className="space-y-6">
                    <p className="font-bold text-2xl text-purple-700 flex items-center gap-2">
                      <span className="text-3xl">✨</span>
                      Here are your options:
                    </p>
                    <div className="grid lg:grid-cols-3 gap-6">
                      {STRUCTURES.map((s, index) => (
                        <div 
                          key={s.type} 
                          className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl p-8 border-4 border-purple-300 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                        >
                          {/* 装饰背景 */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {index + 1}
                              </div>
                              <h4 className="font-bold text-2xl text-purple-700" style={{ fontFamily: 'var(--font-patrick-hand)' }}>
                                {s.name}
                              </h4>
                            </div>
                            <p className="text-base text-gray-700 leading-relaxed" style={{ fontFamily: 'var(--font-comic-neue)' }}>
                              {s.desc}
                            </p>
                            <div className="mt-4 pt-4 border-t-2 border-purple-200">
                              <p className="text-sm font-semibold text-purple-600 mb-2">Structure Steps:</p>
                              <div className="flex flex-wrap gap-2">
                                {s.outline.map((step, i) => (
                                  <span 
                                    key={i}
                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold border border-purple-300"
                                  >
                                    {step}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowOptions(true)}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white border-0 shadow-2xl py-8 text-xl font-bold transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <span className="text-2xl">📖</span>
                      See Structures in Detail
                      <span className="text-2xl">→</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {isGenerating ? (
                <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-12 border-2 border-purple-200 shadow-xl text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700">
                    {museMessage || "Generating example stories with AI images..."}
                  </p>
                </div>
              ) : (
                <>
                  {/* 翻页导航 */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                      <Button
                        onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        variant="outline"
                        className="px-4 py-2"
                      >
                        ← Previous
                      </Button>
                      <div className="flex gap-2">
                        {STRUCTURES.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              currentPage === index
                                ? "bg-purple-600 w-8"
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
                          />
                        ))}
                      </div>
                      <Button
                        onClick={() => setCurrentPage((prev) => Math.min(STRUCTURES.length - 1, prev + 1))}
                        disabled={currentPage === STRUCTURES.length - 1}
                        variant="outline"
                        className="px-4 py-2"
                      >
                        Next →
                      </Button>
                    </div>

                    {/* 当前页的结构内容 - 纸张翻页效果 */}
                    {(() => {
                      const structure = STRUCTURES[currentPage]
                      const example = examples.find((e) => e.structure_type === structure.type)
                      return (
                        <div className="grid lg:grid-cols-12 gap-8">
                          {/* 左侧：结构信息、步骤和示例文章 */}
                          <div className="lg:col-span-8">
                            {/* 纸张效果容器 */}
                            <div className="relative">
                              {/* 纸张阴影效果 */}
                              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg transform rotate-1 opacity-20"></div>
                              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg transform -rotate-1 opacity-20"></div>
                              
                              {/* 纸张主体 */}
                              <div className={`relative bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-2xl p-10 border-4 border-amber-300 shadow-2xl transform transition-all duration-300 hover:shadow-3xl ${isPageFlipping ? 'animate-page-flip' : ''}`}>
                                {/* 纸张纹理 */}
                                <div className="absolute inset-0 opacity-5" style={{
                                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
                                }}></div>
                                
                                <div className="relative z-10">
                                  <h3 className="font-bold text-4xl mb-5 text-purple-700 border-b-4 border-purple-400 pb-4" style={{ fontFamily: 'var(--font-patrick-hand)' }}>{structure.name}</h3>
                                  <p className="text-xl text-gray-700 mb-10 italic leading-relaxed" style={{ fontFamily: 'var(--font-comic-neue)' }}>{structure.desc}</p>
                                  
                                  {/* 步骤和示例文章并排显示 */}
                                  <div className="grid md:grid-cols-2 gap-8">
                                    {/* 左侧：步骤 */}
                                    <div>
                                      <h4 className="font-bold text-2xl mb-5 text-purple-700 flex items-center gap-2" style={{ fontFamily: 'var(--font-patrick-hand)' }}>
                                        <span className="text-3xl">📋</span>
                                        Story Structure Steps:
                                      </h4>
                                      <div className="flex flex-col gap-2">
                                        {structure.outline.map((step, i) => (
                                          <div key={i} className="flex items-center gap-3 bg-gradient-to-r from-white to-purple-50 rounded-lg px-4 py-2 border-2 border-purple-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                                            <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                                              {i + 1}
                                            </span>
                                            <span className="text-sm font-semibold text-purple-700" style={{ fontFamily: 'var(--font-comic-neue)' }}>
                                              {step}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {/* 右侧：示例文章 */}
                                    {example && (
                                      <div>
                                        <h4 className="font-bold text-2xl mb-5 text-purple-700 flex items-center gap-2" style={{ fontFamily: 'var(--font-patrick-hand)' }}>
                                          <span className="text-3xl">📖</span>
                                          Example Story:
                                        </h4>
                                        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 border-3 border-purple-200 shadow-lg">
                                          <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'var(--font-comic-neue)', fontSize: '1rem', lineHeight: '1.75rem', fontWeight: '400' }}>
                                            {example.story}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* 图片显示在下方 - 更大，带边框和填充 */}
                                  {example && example.imageUrl && (
                                    <div className="mt-8 relative">
                                      {/* 装饰性边框背景 */}
                                      <div className="absolute -inset-4 bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 rounded-2xl blur-xl opacity-30"></div>
                                      <div className="absolute -inset-2 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-xl"></div>
                                      
                                      {/* 图片容器 */}
                                      <div className="relative bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-xl p-6 border-4 border-purple-300 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                                        <div className="relative bg-white rounded-lg overflow-hidden">
                                          <img
                                            src={example.imageUrl}
                                            alt={`Example for ${structure.name}`}
                                            className="w-full h-auto max-h-[500px] min-h-[400px] object-contain"
                                          />
                                        </div>
                                        
                                        {/* 装饰性角标 */}
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                                          <span className="text-white text-sm">✨</span>
                                        </div>
                                        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-lg">
                                          <span className="text-white text-sm">🌟</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 右侧：选择按钮和其他信息 */}
                          <div className="lg:col-span-4 space-y-6">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-xl">
                              <h3 className="text-lg font-bold mb-4 text-indigo-700">Your Story Info</h3>
                              <div className="space-y-3 text-sm">
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Character</p>
                                  <p className="text-indigo-700 font-bold">{character?.name || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Setting</p>
                                  <p className="text-purple-700 font-bold">{plot?.setting || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Conflict</p>
                                  <p className="text-pink-700 font-bold">{plot?.conflict || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Goal</p>
                                  <p className="text-orange-700 font-bold">{plot?.goal || "N/A"}</p>
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={() => {
                                setSelected(structure.type)
                                handleSelect(structure.type)
                              }}
                              size="lg"
                              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white border-0 shadow-xl py-6 text-lg font-bold"
                            >
                              Choose This Structure
                            </Button>

                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 shadow-xl">
                              <h4 className="font-bold text-lg mb-3 text-blue-700">All Structures</h4>
                              <div className="space-y-2">
                                {STRUCTURES.map((s, index) => (
                                  <button
                                    key={s.type}
                                    onClick={() => setCurrentPage(index)}
                                    className={`w-full text-left p-3 rounded-lg transition-all ${
                                      currentPage === index
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                                        : "bg-white/80 hover:bg-white border-2 border-blue-200 text-blue-700"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold">{s.name}</span>
                                      {currentPage === index && <span className="text-white">✓</span>}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
