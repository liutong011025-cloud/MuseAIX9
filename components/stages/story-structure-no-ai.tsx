"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Language, StoryState } from "@/app/page"
import StageHeader from "@/components/stage-header"

interface StoryStructureNoAiProps {
  language: Language
  plot: StoryState["plot"] | null
  character: StoryState["character"] | null
  onStructureSelect: (structure: StoryState["structure"]) => void
  onBack: () => void
  userId?: string
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

export default function StoryStructureNoAi({ language, plot, character, onStructureSelect, onBack, userId }: StoryStructureNoAiProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (structureType: string) => {
    const structure = STRUCTURES.find((s) => s.type === structureType)
    if (structure) {
      setSelected(structureType)
      const structureData = {
        type: structure.type as any,
        outline: structure.outline,
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${structure.type}`,
      }
      
      // 保存到interactions
      if (userId) {
        fetch("/api/interactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            stage: "structure",
            input: { character, plot },
            output: { structure: structureData },
          }),
        }).catch((error) => {
          console.error("Error saving structure:", error)
        })
      }
      
      // 自动跳转到下一阶段
      setTimeout(() => {
        onStructureSelect(structureData)
      }, 300)
    }
  }

  return (
    <div className="min-h-screen py-8 px-6 bg-gradient-to-br from-indigo-100 via-purple-50 via-pink-50 to-orange-50 relative" style={{ paddingTop: '100px' }}>
      <div className="max-w-6xl mx-auto">
        <StageHeader stage={3} title="Choose Story Structure" onBack={onBack} />

        <div className="mt-8">
          <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-3xl p-10 border-4 border-purple-300 shadow-2xl backdrop-blur-sm">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4" style={{ fontFamily: 'var(--font-patrick-hand)' }}>
              Story Structure Guide
            </h3>
            <p className="text-gray-700 text-xl mb-8 font-medium leading-relaxed" style={{ fontFamily: 'var(--font-comic-neue)' }}>
              Choose how you want to structure your story! Different structures create different feelings.
            </p>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {STRUCTURES.map((s, index) => (
                <div
                  key={s.type}
                  className={`bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl p-8 border-4 shadow-xl transform transition-all duration-300 relative overflow-hidden ${
                    selected === s.type
                      ? "border-purple-500 scale-105 ring-4 ring-purple-300"
                      : "border-purple-300 hover:scale-105"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                      selected === s.type
                        ? "bg-gradient-to-r from-purple-600 to-pink-600"
                        : "bg-gradient-to-r from-purple-400 to-pink-400"
                    }`}>
                      {index + 1}
                    </div>
                    <h4 className="font-bold text-2xl text-purple-700" style={{ fontFamily: 'var(--font-patrick-hand)' }}>
                      {s.name}
                    </h4>
                  </div>
                  <p className="text-base text-gray-700 leading-relaxed mb-4" style={{ fontFamily: 'var(--font-comic-neue)' }}>
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
                  <Button
                    onClick={() => handleSelect(s.type)}
                    className={`w-full mt-6 ${
                      selected === s.type
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    {selected === s.type ? "✓ Selected" : "Choose This"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

