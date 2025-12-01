"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import StageHeader from "@/components/stage-header"
import { Sparkles } from "lucide-react"

interface CharacterCreationNoAiProps {
  language: "en" | "zh"
  onCharacterCreate: (character: {
    name: string
    age: number
    traits: string[]
    description: string
    imageUrl?: string
    species?: string
  }) => void
  onBack: () => void
  userId?: string
}

const SPECIES = [
  { name: "Boy", icon: "👦", color: "from-blue-400 to-blue-600" },
  { name: "Girl", icon: "👧", color: "from-pink-400 to-pink-600" },
  { name: "Dragon", icon: "🐉", color: "from-green-400 to-green-600" },
  { name: "Robot", icon: "🤖", color: "from-gray-400 to-gray-600" },
  { name: "Unicorn", icon: "🦄", color: "from-purple-400 to-purple-600" },
  { name: "Cat", icon: "🐱", color: "from-yellow-400 to-yellow-600" },
  { name: "Dog", icon: "🐶", color: "from-amber-400 to-amber-600" },
  { name: "Rabbit", icon: "🐰", color: "from-gray-400 to-gray-600" },
  { name: "Bear", icon: "🐻", color: "from-brown-400 to-brown-600" },
  { name: "Fox", icon: "🦊", color: "from-orange-400 to-orange-600" },
  { name: "Lion", icon: "🦁", color: "from-yellow-400 to-orange-600" },
  { name: "Tiger", icon: "🐯", color: "from-orange-400 to-red-600" },
  { name: "Panda", icon: "🐼", color: "from-gray-400 to-black" },
  { name: "Elephant", icon: "🐘", color: "from-gray-500 to-gray-700" },
  { name: "Penguin", icon: "🐧", color: "from-blue-500 to-black" },
  { name: "Owl", icon: "🦉", color: "from-amber-500 to-brown-600" },
]

const TRAITS = [
  { name: "Brave", color: "from-red-400 to-red-600" },
  { name: "Kind", color: "from-green-400 to-green-600" },
  { name: "Curious", color: "from-blue-400 to-blue-600" },
  { name: "Funny", color: "from-yellow-400 to-yellow-600" },
  { name: "Clever", color: "from-purple-400 to-purple-600" },
  { name: "Shy", color: "from-indigo-400 to-indigo-600" },
  { name: "Adventurous", color: "from-orange-400 to-orange-600" },
  { name: "Loyal", color: "from-pink-400 to-pink-600" },
]

export default function CharacterCreationNoAi({ language, onCharacterCreate, onBack, userId }: CharacterCreationNoAiProps) {
  const [name, setName] = useState("")
  const [species, setSpecies] = useState("")
  const [customSpecies, setCustomSpecies] = useState("")
  const [selectedTraits, setSelectedTraits] = useState<string[]>([])
  const [description, setDescription] = useState("")

  const toggleTrait = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    )
  }

  const handleCreate = () => {
    if (!name.trim()) {
      return
    }
    const finalSpecies = species === "Custom" ? customSpecies.trim() : species
    if (!finalSpecies) {
      return
    }
    const defaultAge = finalSpecies === "Boy" || finalSpecies === "Girl" ? 8 : 0
    
    // 无AI版本不生成图片
    const character = {
      name,
      age: defaultAge,
      traits: selectedTraits,
      description,
      // 无图片
      species: finalSpecies,
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
          stage: "character",
          input: {},
          output: { character },
        }),
      }).catch((error) => {
        console.error("Error saving character:", error)
      })
    }
    
    onCharacterCreate(character)
  }

  const finalSpecies = species === "Custom" ? customSpecies.trim() : species
  const canContinue = name.trim() && finalSpecies && selectedTraits.length > 0

  return (
    <div className="min-h-screen py-8 px-6 bg-gradient-to-br from-indigo-100 via-purple-50 via-pink-50 to-orange-50 relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <StageHeader stage={1} title="Create Your Character" onBack={onBack} />

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* 表单区域 */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 border-4 border-blue-300 shadow-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-blue-700 mb-6" style={{ fontFamily: 'var(--font-patrick-hand)' }}>
              Design Your Hero!
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-bold mb-2 text-blue-700">Character Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sparky the Dragon"
                  className="border-2 border-blue-200 focus:border-blue-500 rounded-xl p-3 text-base"
                />
              </div>

              <div>
                <label className="block text-lg font-bold mb-2 text-blue-700">Species</label>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2">
                  {SPECIES.map((spec) => {
                    const isSelected = species === spec.name
                    return (
                      <Button
                        key={spec.name}
                        onClick={() => setSpecies(spec.name)}
                        className={`flex flex-col items-center justify-center p-3 h-auto rounded-xl border-2 transition-all transform hover:scale-105 ${
                          isSelected
                            ? `bg-gradient-to-r ${spec.color} text-white border-blue-400 shadow-lg`
                            : "bg-white border-blue-200 text-gray-700 hover:bg-blue-50"
                        }`}
                      >
                        <span className="text-2xl mb-1">{spec.icon}</span>
                        <span className="text-xs font-semibold">{spec.name}</span>
                      </Button>
                    )
                  })}
                  <Button
                    onClick={() => setSpecies("Custom")}
                    className={`flex flex-col items-center justify-center p-3 h-auto rounded-xl border-2 transition-all transform hover:scale-105 ${
                      species === "Custom"
                        ? "bg-gradient-to-r from-gray-600 to-gray-800 text-white border-blue-400 shadow-lg"
                        : "bg-white border-blue-200 text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <span className="text-2xl mb-1">✏️</span>
                    <span className="text-xs font-semibold">Custom</span>
                  </Button>
                </div>
                {species === "Custom" && (
                  <Input
                    value={customSpecies}
                    onChange={(e) => setCustomSpecies(e.target.value)}
                    placeholder="Enter custom species..."
                    className="mt-3 border-2 border-blue-200 focus:border-blue-500 rounded-xl p-3 text-base"
                  />
                )}
              </div>

              <div>
                <label className="block text-lg font-bold mb-2 text-blue-700">Traits (Select at least one)</label>
                <div className="flex flex-wrap gap-2">
                  {TRAITS.map((trait) => {
                    const isSelected = selectedTraits.includes(trait.name)
                    return (
                      <Button
                        key={trait.name}
                        onClick={() => toggleTrait(trait.name)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all transform hover:scale-105 ${
                          isSelected
                            ? `bg-gradient-to-r ${trait.color} text-white border-blue-400 shadow-md`
                            : "bg-white border-blue-200 text-gray-700 hover:bg-blue-50"
                        }`}
                      >
                        {trait.name}
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold mb-2 text-blue-700">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., A friendly dragon who loves to read books and help others."
                  rows={3}
                  className="w-full p-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 bg-white text-foreground text-base"
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={!canContinue}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white border-0 shadow-xl py-4 text-lg font-bold disabled:opacity-50"
              >
                <Sparkles className="mr-2 h-5 w-5 inline" />
                Continue to Plot
              </Button>
            </div>
          </div>

          {/* 预览区域 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-4 border-purple-300 shadow-2xl backdrop-blur-sm flex flex-col justify-center">
            {name && finalSpecies && selectedTraits.length > 0 ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center text-8xl shadow-2xl">
                    {SPECIES.find(s => s.name === species)?.icon || "👤"}
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {name}
                  </h3>
                  <p className="text-xl text-gray-700 font-semibold mb-4">{finalSpecies}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedTraits.map((trait) => {
                      const traitData = TRAITS.find(t => t.name === trait)
                      return (
                        <span
                          key={trait}
                          className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${traitData?.color || 'from-gray-400 to-gray-600'} text-white shadow-lg`}
                        >
                          {trait}
                        </span>
                      )
                    })}
                  </div>
                  {description && (
                    <p className="mt-4 text-gray-600 italic">{description}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-7xl mb-4">🥚</div>
                <p className="text-xl font-semibold">Fill in the form to see your character!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

