"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface StageHeaderProps {
  stage: number
  title: string
  onBack: () => void
  character?: string
}

export default function StageHeader({ stage, title, onBack, character }: StageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="ghost" size="icon" className="rounded-full hover:bg-secondary/20">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Stage {stage} of 5</div>
          <h1 className="text-3xl font-bold text-foreground">
            {title}
            {character && <span className="text-primary"> - {character}</span>}
          </h1>
        </div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= stage ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>
    </div>
  )
}
