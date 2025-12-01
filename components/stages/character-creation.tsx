"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Language, StoryState } from "@/app/page"
import StageHeader from "@/components/stage-header"
import ProgressMentor from "@/components/progress-mentor"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface CharacterCreationProps {
  language: Language
  onCharacterCreate: (character: StoryState["character"]) => void
  onBack: () => void
  userId?: string
}

const TRAITS = [
  { name: "Brave", color: "from-red-400 to-red-600" },
  { name: "Smart", color: "from-blue-400 to-blue-600" },
  { name: "Funny", color: "from-yellow-400 to-yellow-600" },
  { name: "Kind", color: "from-green-400 to-green-600" },
  { name: "Curious", color: "from-purple-400 to-purple-600" },
  { name: "Strong", color: "from-orange-400 to-orange-600" },
  { name: "Creative", color: "from-pink-400 to-pink-600" },
  { name: "Loyal", color: "from-indigo-400 to-indigo-600" },
]

const SPECIES = [
  { name: "Boy", icon: "👦", color: "from-blue-400 to-blue-600" },
  { name: "Girl", icon: "👧", color: "from-pink-400 to-pink-600" },
  { name: "Cat", icon: "🐱", color: "from-orange-400 to-orange-600" },
  { name: "Dog", icon: "🐶", color: "from-yellow-400 to-yellow-600" },
  { name: "Rabbit", icon: "🐰", color: "from-gray-400 to-gray-600" },
  { name: "Bear", icon: "🐻", color: "from-amber-400 to-amber-600" },
  { name: "Fox", icon: "🦊", color: "from-red-400 to-red-600" },
  { name: "Lion", icon: "🦁", color: "from-yellow-400 to-orange-600" },
  { name: "Tiger", icon: "🐯", color: "from-orange-400 to-red-600" },
  { name: "Dragon", icon: "🐉", color: "from-purple-400 to-pink-600" },
  { name: "Unicorn", icon: "🦄", color: "from-purple-400 to-indigo-600" },
  { name: "Panda", icon: "🐼", color: "from-gray-400 to-black" },
]

export default function CharacterCreation({ language, onCharacterCreate, onBack, userId }: CharacterCreationProps) {
  const [name, setName] = useState("")
  const [species, setSpecies] = useState("")
  const [customSpecies, setCustomSpecies] = useState("")
  const [selectedTraits, setSelectedTraits] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentAction, setCurrentAction] = useState<string>("")

  const toggleTrait = (traitName: string) => {
    setSelectedTraits((prev) => {
      const newTraits = prev.includes(traitName) ? prev.filter((t) => t !== traitName) : [...prev, traitName].slice(0, 3)
      setCurrentAction(`Selected trait: ${traitName}`)
      return newTraits
    })
  }

  // 监听输入变化
  useEffect(() => {
    if (name.trim()) {
      setCurrentAction(`Entered character name: ${name}`)
    }
  }, [name])

  useEffect(() => {
    if (species) {
      setCurrentAction(`Selected species: ${species}`)
    }
  }, [species])

  useEffect(() => {
    if (imageUrl) {
      setCurrentAction("Generated character image")
    }
  }, [imageUrl])

  const generateImage = async () => {
    if (!name.trim()) {
      toast.error("Please enter character name first")
      return
    }
    const finalSpecies = species === "Custom" ? customSpecies.trim() : species
    if (!finalSpecies) {
      toast.error("Please select or enter a species first")
      return
    }

    setIsGenerating(true)
    toast.info("Generating character image...")
    
    try {
      const speciesInfo = SPECIES.find(s => s.name === species)
      const prompt = `A charming cartoon illustration of ${species === "Boy" || species === "Girl" ? `a young ${species.toLowerCase()}` : `a ${finalSpecies.toLowerCase()}`} character named ${name}. ${selectedTraits.length > 0 ? `The character looks ${selectedTraits.join(', ')}. ` : ''}${description ? description + '. ' : ''}Fun and colorful style suitable for children's stories.`

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt,
          user_id: userId,
          stage: 'character'
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error || "Failed to generate image, please try again")
        return
      }

      if (data.imageUrl) {
        setImageUrl(data.imageUrl)
        toast.success("Image generated successfully!")
      } else {
        toast.error("Failed to generate image, please try again")
      }
    } catch (error) {
      console.error("Error generating image:", error)
      toast.error("Failed to generate image, please try again")
    } finally {
      setIsGenerating(false)
    }
  }

  const finalSpecies = species === "Custom" ? customSpecies.trim() : species

  // 检查是否可以继续：name、imageUrl必须存在，且species不能是unknown或空
  const canContinue = name.trim() && imageUrl && finalSpecies && finalSpecies.toLowerCase() !== "unknown"

  const handleCreate = () => {
    if (canContinue) {
      // 为species设置默认age，如果是动物可能需要不同的处理
      const defaultAge = finalSpecies === "Boy" || finalSpecies === "Girl" ? 8 : 0
      onCharacterCreate({
        name,
        age: defaultAge,
        traits: selectedTraits,
        description,
        imageUrl: imageUrl,
        species: finalSpecies,
      })
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 via-pink-50 to-orange-50 relative">
      {/* 高级背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Progress Mentor - 右下角 */}
      <ProgressMentor
        stage="character"
        action={currentAction}
        context={{
          name,
          species: species === "Custom" ? customSpecies : species,
          traits: selectedTraits,
          description,
          hasImage: !!imageUrl,
        }}
        userId={userId}
        position="bottom-right"
      />

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <div className="px-8 lg:px-12 py-4">
          <StageHeader stage={1} title="Create Your Character" onBack={onBack} />
        </div>

        <div className="flex-1 grid lg:grid-cols-12 gap-6 px-8 lg:px-12 pb-6 overflow-hidden">

                 {/* 表单区域 */}
                 <div className="lg:col-span-5 space-y-3 overflow-y-auto">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200 shadow-xl backdrop-blur-sm">
              <label className="block text-sm font-bold mb-2 text-purple-700">Character Name</label>
              <Input
                placeholder="Enter name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-purple-200 focus:border-purple-500 rounded-xl"
              />
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-200 shadow-xl backdrop-blur-sm">
              <label className="block text-sm font-bold mb-2 text-blue-700">Species</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {SPECIES.map((spec) => {
                  const isSelected = species === spec.name
                  return (
                    <button
                      key={spec.name}
                      onClick={() => setSpecies(spec.name)}
                      className={`p-3 rounded-xl text-xs font-semibold transition-all shadow-lg flex flex-col items-center gap-1 ${
                        isSelected
                          ? `bg-gradient-to-r ${spec.color} text-white transform scale-105`
                          : "bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-lg">{spec.icon}</span>
                      <span>{spec.name}</span>
                    </button>
                  )
                })}
                <button
                  onClick={() => setSpecies("Custom")}
                  className={`p-3 rounded-xl text-xs font-semibold transition-all shadow-lg flex flex-col items-center gap-1 ${
                    species === "Custom"
                      ? "bg-gradient-to-r from-indigo-400 to-purple-600 text-white transform scale-105"
                      : "bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg">✏️</span>
                  <span>Custom</span>
                </button>
              </div>
              {species === "Custom" && (
                <Input
                  placeholder="Enter custom species..."
                  value={customSpecies}
                  onChange={(e) => setCustomSpecies(e.target.value)}
                  className="border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                />
              )}
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border-2 border-orange-200 shadow-xl backdrop-blur-sm">
              <label className="block text-sm font-bold mb-2 text-orange-700">Traits (Select up to 3)</label>
              <div className="grid grid-cols-2 gap-2">
                {TRAITS.map((trait) => {
                  const isSelected = selectedTraits.includes(trait.name)
                  return (
                    <button
                      key={trait.name}
                      onClick={() => toggleTrait(trait.name)}
                      className={`p-2 rounded-xl text-xs font-semibold transition-all shadow-lg ${
                        isSelected
                          ? `bg-gradient-to-r ${trait.color} text-white transform scale-105`
                          : "bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {trait.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200 shadow-xl backdrop-blur-sm">
              <label className="block text-sm font-bold mb-2 text-green-700">Description</label>
              <textarea
                placeholder="Describe your character..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-20 p-3 rounded-xl border-2 border-green-200 focus:border-green-500 bg-white/80 text-foreground resize-none text-sm"
              />
            </div>

            <Button
              onClick={generateImage}
              disabled={!name.trim() || !finalSpecies || isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white border-0 shadow-xl py-4 text-sm font-bold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Create My Character</span>
                </>
              )}
            </Button>
          </div>

                 {/* 图片预览区域 - 右侧 */}
                 <div className="lg:col-span-7 flex flex-col items-center justify-center">
            {imageUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <div className="relative group flex items-center justify-center max-w-md">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative bg-gradient-to-br from-white to-purple-50 rounded-3xl p-4 border-4 border-purple-200 shadow-2xl backdrop-blur-sm w-full">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {name || "Character"}
                        </h3>
                        {finalSpecies && (
                          <p className="text-xs text-gray-600 font-semibold mt-1">
                            {species === "Custom" ? "✏️" : SPECIES.find(s => s.name === species)?.icon} {finalSpecies}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-wrap max-w-[120px]">
                        {selectedTraits.slice(0, 3).map((trait) => {
                          const traitData = TRAITS.find(t => t.name === trait)
                          return (
                            <span
                              key={trait}
                              className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${traitData?.color || 'from-gray-400 to-gray-600'} text-white shadow-lg`}
                            >
                              {trait}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-xl shadow-xl bg-gray-100">
                      <img
                        src={imageUrl}
                        alt="Character"
                        className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105 max-h-[500px] min-h-[400px]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    </div>
                  </div>
                </div>
                {/* 继续按钮 - 在图片下方 */}
                <Button
                  onClick={handleCreate}
                  disabled={!canContinue}
                  size="lg"
                  className={`w-full max-w-md border-0 shadow-xl py-6 text-base font-bold ${
                    canContinue
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white animate-pulse"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Continue to Plot →
                </Button>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-6">
                  {/* 大蛋 - 放在提示文字上方 */}
                  <div className="flex justify-center">
                    <div className={`text-9xl ${isGenerating ? 'animate-shake' : ''}`}>
                      🥚
                    </div>
                  </div>
                  <div className="inline-block p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl border-4 border-dashed border-purple-300 shadow-xl">
                    <p className="text-gray-600 font-semibold text-lg">Generate your character image</p>
                    <p className="text-sm text-gray-500 mt-2">Fill in the form and click generate</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
