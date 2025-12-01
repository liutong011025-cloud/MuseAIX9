"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Language, StoryState } from "@/app/page"
import StageHeader from "@/components/stage-header"

interface PlotBrainstormNoAiProps {
  language: Language
  character: StoryState["character"] | null
  onPlotCreate: (plot: StoryState["plot"]) => void
  onBack: () => void
  userId?: string
}

// 根据species返回对应的emoji图标
const getSpeciesIcon = (species: string): string => {
  const speciesMap: Record<string, string> = {
    "Boy": "👦",
    "Girl": "👧",
    "Dragon": "🐉",
    "Robot": "🤖",
    "Unicorn": "🦄",
    "Cat": "🐱",
    "Dog": "🐶",
    "Rabbit": "🐰",
    "Bear": "🐻",
    "Fox": "🦊",
    "Lion": "🦁",
    "Tiger": "🐯",
    "Panda": "🐼",
    "Elephant": "🐘",
    "Penguin": "🐧",
    "Owl": "🦉",
  }
  return speciesMap[species] || "👤"
}

export default function PlotBrainstormNoAi({ language, character, onPlotCreate, onBack, userId }: PlotBrainstormNoAiProps) {
  const [setting, setSetting] = useState("")
  const [conflict, setConflict] = useState("")
  const [goal, setGoal] = useState("")

  const handleContinue = () => {
    if (setting.trim() && conflict.trim() && goal.trim()) {
      const plot = {
        setting: setting.trim(),
        conflict: conflict.trim(),
        goal: goal.trim(),
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
            stage: "plot",
            input: { character },
            output: { plot },
          }),
        }).catch((error) => {
          console.error("Error saving plot:", error)
        })
      }
      
      if (onPlotCreate && typeof onPlotCreate === 'function') {
        onPlotCreate(plot)
      } else {
        console.error("onPlotCreate is not a function:", typeof onPlotCreate, onPlotCreate)
      }
    }
  }

  const canContinue = setting.trim() && conflict.trim() && goal.trim()

  return (
    <div className="min-h-screen py-8 px-6 bg-gradient-to-br from-blue-100 via-cyan-50 via-purple-50 to-pink-50 relative" style={{ paddingTop: '100px' }}>
      <div className="max-w-5xl mx-auto">
        <StageHeader stage={2} title="Brainstorm Your Plot" onBack={onBack} character={character?.name} />

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          {/* 角色信息 */}
          {character && (
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-xl">
                <h3 className="text-lg font-bold mb-3 text-indigo-700">Your Character</h3>
                {/* 显示角色图标 */}
                <div className="mb-4 flex justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center text-6xl shadow-xl">
                    {getSpeciesIcon(character.species || "")}
                  </div>
                </div>
                <p className="text-xl font-bold text-indigo-700 text-center">{character.name}</p>
                {character.species && (
                  <p className="text-sm text-gray-600 mt-1 text-center">{character.species}</p>
                )}
                {character.traits && character.traits.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    {character.traits.map((trait) => (
                      <span
                        key={trait}
                        className="px-2 py-1 bg-indigo-200 text-indigo-700 rounded-full text-xs font-semibold"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 表单区域 */}
          <div className={character ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-8 border-2 border-purple-200 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-purple-700" style={{ fontFamily: 'var(--font-patrick-hand)' }}>
                Tell Your Story!
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold mb-3 text-purple-700">
                    🌍 Setting
                  </label>
                  <p className="text-sm text-gray-600 mb-2">Where does your story take place?</p>
                  <Input
                    value={setting}
                    onChange={(e) => setSetting(e.target.value)}
                    placeholder="e.g., A magical forest, a school, outer space..."
                    className="border-2 border-purple-200 focus:border-purple-500 rounded-xl p-3 text-base"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold mb-3 text-purple-700">
                    ⚔️ Conflict
                  </label>
                  <p className="text-sm text-gray-600 mb-2">What problem or challenge does your character face?</p>
                  <Input
                    value={conflict}
                    onChange={(e) => setConflict(e.target.value)}
                    placeholder="e.g., A dragon stole the magic crystal, bullies at school..."
                    className="border-2 border-purple-200 focus:border-purple-500 rounded-xl p-3 text-base"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold mb-3 text-purple-700">
                    🎯 Goal
                  </label>
                  <p className="text-sm text-gray-600 mb-2">What does your character want to achieve?</p>
                  <Input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Save the village, make new friends, find the treasure..."
                    className="border-2 border-purple-200 focus:border-purple-500 rounded-xl p-3 text-base"
                  />
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!canContinue}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white border-0 shadow-xl py-6 text-lg font-bold disabled:opacity-50"
                >
                  Continue to Story Structure →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

