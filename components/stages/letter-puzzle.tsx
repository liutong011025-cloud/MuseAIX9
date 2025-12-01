"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import StageHeader from "@/components/stage-header"
import { CheckCircle2, RotateCcw, Mail } from "lucide-react"

interface LetterPuzzleProps {
  sections: string[]
  structure: string[]
  onPuzzleComplete: (reorderedSections: string[]) => void
  onBack: () => void
}

// 固定打乱顺序：24351（即索引 1,3,2,4,0）
// 原始顺序：0,1,2,3,4 -> 打乱后：1,3,2,4,0
const fixedShuffle = <T,>(array: T[]): T[] => {
  if (array.length !== 5) {
    // 如果不是5个元素，使用随机打乱
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
  // 固定顺序：24351（原始索引 0,1,2,3,4 -> 新索引 1,3,2,4,0）
  const order = [1, 3, 2, 4, 0] // 对应原始索引
  return order.map(idx => array[idx])
}

export default function LetterPuzzle({
  sections,
  structure,
  onPuzzleComplete,
  onBack
}: LetterPuzzleProps) {
  const [dropZones, setDropZones] = useState<(number | null)[]>(structure.map(() => null))
  const [draggedItem, setDraggedItem] = useState<{ originalIndex: number; source: 'available' | 'zone' } | null>(null)
  // 打乱顺序的可拖拽段落（只在客户端初始化时打乱，使用 useEffect 避免 SSR 不一致）
  const [shuffledSections, setShuffledSections] = useState<number[]>([])
  const completeSectionRef = useRef<HTMLDivElement>(null)

  // 在客户端初始化时打乱顺序 - 使用固定顺序24351
  useEffect(() => {
    if (sections.length > 0) {
      const indices = sections.map((_, index) => index)
      const shuffled = fixedShuffle(indices)
      console.log("LetterPuzzle - Original indices:", indices)
      console.log("LetterPuzzle - Shuffled indices:", shuffled)
      setShuffledSections(shuffled)
    }
  }, [sections]) // 依赖 sections，每次 sections 变化（包括内容变化）都重新打乱

  // 计算可用的部分（还没有被放入放置区的）
  const availableSections = shuffledSections.length > 0 
    ? shuffledSections.filter(index => !dropZones.includes(index))
    : [] // 在初始打乱完成前返回空数组

  const handleDragStart = (originalIndex: number, source: 'available' | 'zone') => {
    setDraggedItem({ originalIndex, source })
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const handleDropToZone = (e: React.DragEvent, zoneIndex: number) => {
    e.preventDefault()
    if (draggedItem) {
      const newDropZones = [...dropZones]
      // 如果目标区域已有内容，先移除
      if (newDropZones[zoneIndex] !== null) {
        // 不做任何事，保持原样
        return
      }
      newDropZones[zoneIndex] = draggedItem.originalIndex
      setDropZones(newDropZones)
      setDraggedItem(null)
    }
  }

  const handleRemoveFromZone = (zoneIndex: number) => {
    const newDropZones = [...dropZones]
    newDropZones[zoneIndex] = null
    setDropZones(newDropZones)
  }

  const handleReset = () => {
    setDropZones(structure.map(() => null))
    toast.info("Order reset! Try again! 🔄")
  }

  // 检查顺序是否正确（按索引顺序）
  const isCorrectOrder = dropZones.every((item, index) => item === index) && 
                         dropZones.every(item => item !== null)

  // 当顺序正确时，自动滚动到完成区域
  useEffect(() => {
    if (isCorrectOrder && completeSectionRef.current) {
      setTimeout(() => {
        completeSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }, 500)
    }
  }, [isCorrectOrder])

  const handleComplete = () => {
    if (isCorrectOrder) {
      const reorderedSections = dropZones.map(idx => sections[idx!])
      onPuzzleComplete(reorderedSections)
    }
  }

  return (
    <div className="min-h-screen py-6 px-4 bg-gradient-to-br from-pink-100 via-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10" style={{ paddingTop: '80px' }}>
        <StageHeader onBack={onBack} />

        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            🧩 Arrange Your Letter
          </h1>
          <p className="text-lg text-gray-700">
            Drag and drop the sections to put them in the correct order!
          </p>
        </div>

        {/* 主要内容区域 - 左右布局 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* 左侧：放置区 (Drop Zones) - 垂直排列 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-4 border-green-300 shadow-2xl animate-fade-in-up">
            <h2 className="text-xl font-bold text-green-700 mb-4 text-center animate-bounce-in">
              Arrange Here! 👇
            </h2>
            <div className="space-y-3">
              {structure.map((sectionName, index) => (
                <div
                  key={`drop-zone-${index}`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.add('scale-105', 'border-green-500', 'bg-green-100')
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('scale-105', 'border-green-500', 'bg-green-100')
                  }}
                  onDrop={(e) => {
                    e.currentTarget.classList.remove('scale-105', 'border-green-500', 'bg-green-100')
                    handleDropToZone(e, index)
                  }}
                  className={`relative bg-white/80 backdrop-blur-sm rounded-xl p-4 border-3 border-dashed transition-all duration-300 min-h-[100px] flex flex-col justify-center items-center text-center transform hover:scale-[1.02] hover:shadow-md ${
                    dropZones[index] !== null 
                      ? 'border-green-500 bg-green-100 shadow-inner animate-bounce-in' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                  style={{
                    animationDelay: `${index * 0.08}s`,
                  }}
                >
                  <p className="text-base font-bold text-green-800 mb-2">
                    {sectionName}
                  </p>
                  {dropZones[index] === null ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 border-2 border-dashed border-gray-300 rounded-lg animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="w-full animate-scale-in">
                      <div
                        draggable
                        onDragStart={() => handleDragStart(dropZones[index]!, 'zone')}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnd={handleDragEnd}
                        className={`w-full bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3 border-2 border-green-300 shadow-md cursor-grab transition-all duration-200 hover:scale-105 ${
                          draggedItem?.originalIndex === dropZones[index] && draggedItem?.source === 'zone' ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        <p className="font-medium text-green-900 text-xs line-clamp-2">{sections[dropZones[index]!]}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromZone(index)}
                        className="mt-1 text-xs text-red-600 hover:text-red-800 hover:scale-110 transition-transform"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：可拖拽段落块 - 打乱顺序 */}
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-6 border-4 border-blue-300 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-bold text-blue-700 mb-4 text-center animate-bounce-in">
              Your Sections 📦
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {availableSections.map((originalIndex, idx) => (
                <div
                  key={`available-${originalIndex}`}
                  draggable
                  onDragStart={() => handleDragStart(originalIndex, 'available')}
                  onDragEnd={handleDragEnd}
                  className={`bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 border-3 border-blue-200 shadow-lg cursor-grab transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-purple-400 animate-bounce-in ${
                    draggedItem?.originalIndex === originalIndex && draggedItem?.source === 'available' 
                      ? 'opacity-50 scale-95 rotate-2 z-50' 
                      : 'hover:-rotate-1'
                  }`}
                  style={{
                    animationDelay: `${idx * 0.05}s`,
                  }}
                >
                  <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">{sections[originalIndex]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 完成状态和按钮 */}
        {isCorrectOrder ? (
          <div 
            ref={completeSectionRef}
            className="bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 rounded-3xl p-10 border-4 border-green-400 shadow-2xl text-center relative overflow-hidden animate-fade-in-up mt-8"
          >
            <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-4 right-4 text-6xl animate-bounce">🎉</div>
            <div className="absolute top-4 left-4 text-6xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
            <h2 className="text-5xl font-bold text-green-800 mb-6 relative z-10 animate-bounce-in" style={{ fontFamily: 'Kalam, cursive' }}>
              Your Letter is Perfect! 🎉
            </h2>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-4 border-green-300 shadow-xl max-w-3xl mx-auto transform rotate-1 -translate-y-2 hover:rotate-0 hover:translate-y-0 transition-all duration-500 animate-scale-in">
              <pre className="text-lg text-gray-800 whitespace-pre-wrap text-left leading-relaxed" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                {dropZones.map(idx => sections[idx!]).join('\n\n')}
              </pre>
            </div>
            <Button
              onClick={handleComplete}
              className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg py-4 px-8 text-xl font-bold rounded-xl hover:scale-110 transition-all duration-300 flex items-center justify-center gap-3 mx-auto animate-gentle-bounce"
            >
              <Mail className="w-6 h-6 animate-wiggle" />
              Continue to Final Letter
              <CheckCircle2 className="w-6 h-6 animate-pulse" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center gap-4 mt-8 animate-fade-in-up">
            <Button
              onClick={handleReset}
              variant="outline"
              className="px-6 py-3 bg-white/80 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl font-bold shadow-lg hover:scale-110 transition-all"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset Order
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

