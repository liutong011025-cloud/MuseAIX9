"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Sparkles, BookOpen, Mail, FileText, Clock, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface Work {
  id: string
  type: 'story' | 'review' | 'letter'
  title: string
  preview: string
  updatedAt: string
  data: any
}

interface ContinueWorksDialogProps {
  open: boolean
  userId: string
  onStartNew: () => void
  onContinue: (work: Work) => void
  onClose: () => void
}

export default function ContinueWorksDialog({
  open,
  userId,
  onStartNew,
  onContinue,
  onClose,
}: ContinueWorksDialogProps) {
  const [works, setWorks] = useState<Work[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open && userId) {
      fetchUserWorks()
    }
  }, [open, userId])

  const fetchUserWorks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/user-works?user_id=${userId}&type=all`)
      const data = await response.json()

      if (data.success) {
        const allWorks: Work[] = []

        // 处理故事
        if (data.stories && data.stories.length > 0) {
          data.stories.forEach((story: any) => {
            allWorks.push({
              id: story.id,
              type: 'story',
              title: `Story: ${(story.character as any)?.name || 'Untitled'}`,
              preview: story.content?.substring(0, 100) || 'No content yet',
              updatedAt: story.updatedAt,
              data: story,
            })
          })
        }

        // 处理书评
        if (data.reviews && data.reviews.length > 0) {
          data.reviews.forEach((review: any) => {
            allWorks.push({
              id: review.id,
              type: 'review',
              title: `${review.reviewType || 'Review'}: ${review.bookTitle || 'Untitled'}`,
              preview: review.content?.substring(0, 100) || 'No content yet',
              updatedAt: review.updatedAt,
              data: review,
            })
          })
        }

        // 处理信件
        if (data.letters && data.letters.length > 0) {
          data.letters.forEach((letter: any) => {
            allWorks.push({
              id: letter.id,
              type: 'letter',
              title: `Letter to ${letter.recipient || 'Unknown'}`,
              preview: letter.content?.substring(0, 100) || 'No content yet',
              updatedAt: letter.updatedAt,
              data: letter,
            })
          })
        }

        // 按更新时间排序
        allWorks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        setWorks(allWorks)
      }
    } catch (error) {
      console.error('Error fetching user works:', error)
      toast.error('Failed to load your works')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story':
        return <FileText className="w-5 h-5" />
      case 'review':
        return <BookOpen className="w-5 h-5" />
      case 'letter':
        return <Mail className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'story':
        return 'from-blue-500 to-cyan-500'
      case 'review':
        return 'from-purple-500 to-pink-500'
      case 'letter':
        return 'from-orange-500 to-red-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-purple-50 to-pink-50 border-4 border-purple-300 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent text-center flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            Welcome Back!
          </DialogTitle>
          <DialogDescription className="text-center text-lg text-gray-700 mt-2">
            Would you like to start a new writing project or continue with your previous work?
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* 开始新的按钮 */}
          <Button
            onClick={onStartNew}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white border-0 shadow-xl py-8 text-2xl font-bold rounded-2xl hover:scale-105 transition-all duration-300"
          >
            <Sparkles className="w-6 h-6 mr-3" />
            Start New Writing Project
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>

          {/* 继续之前的作品 */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your works...</p>
            </div>
          ) : works.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-700 text-center mb-4">
                Continue Your Previous Work
              </h3>
              <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                {works.map((work) => (
                  <button
                    key={work.id}
                    onClick={() => onContinue(work)}
                    className={`bg-gradient-to-r ${getTypeColor(work.type)} hover:opacity-90 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] text-left`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-white/20 rounded-lg p-3">
                          {getTypeIcon(work.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xl font-bold mb-2 truncate">{work.title}</h4>
                          <p className="text-white/90 text-sm mb-3 line-clamp-2">{work.preview}...</p>
                          <div className="flex items-center gap-2 text-white/80 text-xs">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(work.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-6 h-6 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No previous works found. Start a new project!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

