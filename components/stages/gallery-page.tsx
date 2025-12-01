"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { BookOpen, Book, Mail, FileText, ChevronDown, ChevronRight, Sparkles, ArrowLeft } from "lucide-react"

type ArticleType = "story" | "bookReview" | "letter"

interface Article {
  id: string
  title: string
  author: string
  type: ArticleType
  content: string
  timestamp: number
  coverUrl?: string
  recipient?: string
  occasion?: string
  bookTitle?: string
}

interface GalleryPageProps {
  onBack?: () => void
  fromEdit?: boolean
  editType?: 'story' | 'review' | 'letter'
  onBackToEdit?: () => void
}

export default function GalleryPage({ onBack, fromEdit = false, editType, onBackToEdit }: GalleryPageProps) {
  const [selectedType, setSelectedType] = useState<ArticleType | null>(null)
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set())
  const [interactions, setInteractions] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchInteractions()
    const interval = setInterval(fetchInteractions, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchInteractions = async () => {
    try {
      const response = await fetch('/api/interactions')
      const data = await response.json()
      setInteractions(data.interactions || [])
    } catch (error) {
      console.error("Error fetching interactions:", error)
    }
  }

  // 从 interactions 提取文章
  const extractArticles = (): Article[] => {
    const articles: Article[] = []

    // 从 interactions 中提取 Story 文章
    interactions
      .filter(i => i.story && (i.stage === 'review' || i.story.trim().length > 0))
      .forEach((i, idx) => {
        const story = typeof i.story === 'string' ? i.story : (i.output?.story || '')
        if (story.trim()) {
          articles.push({
            id: `story-${i.user_id}-${i.timestamp}`,
            title: `${i.character?.name || 'Unknown'}'s Adventure`,
            author: i.user_id,
            type: 'story',
            content: story,
            timestamp: i.timestamp,
          })
        }
      })

    // 从 interactions 中提取 Book Review 文章
    // 检查 stage 为 bookReviewComplete 或者有 review 内容
    // 过滤掉内容太少的review（少于50个字符）
    interactions
      .filter(i => {
        const hasReview = i.review && (typeof i.review === 'string' ? i.review.trim().length > 0 : false)
        const isCompleteStage = i.stage === 'bookReviewComplete' || i.stage === 'bookReviewCompleteNoAi'
        return hasReview || isCompleteStage
      })
      .forEach((i, idx) => {
        const review = typeof i.review === 'string' ? i.review : (i.output?.review || i.data?.review || '')
        const reviewText = review.trim()
        // 只添加内容长度大于50个字符的review（过滤掉测试内容或空内容）
        if (reviewText && reviewText.length > 50) {
          articles.push({
            id: `review-${i.user_id}-${i.timestamp || Date.now()}`,
            title: `${i.reviewType || i.data?.reviewType || 'Book'} Review: ${i.bookTitle || i.data?.bookTitle || 'Unknown Book'}`,
            author: i.user_id,
            type: 'bookReview',
            content: review,
            timestamp: i.timestamp || Date.now(),
            bookTitle: i.bookTitle || i.data?.bookTitle,
            coverUrl: i.bookCoverUrl || i.data?.bookCoverUrl,
          })
        }
      })

    // 从 interactions 中提取 Letter 文章
    interactions
      .filter(i => i.letter && (i.stage === 'letterComplete' || i.letter.trim().length > 0))
      .forEach((i, idx) => {
        const letter = typeof i.letter === 'string' ? i.letter : (i.output?.letter || '')
        if (letter.trim()) {
          articles.push({
            id: `letter-${i.user_id}-${i.timestamp}`,
            title: `Letter to ${i.recipient || 'Someone'}`,
            author: i.user_id,
            type: 'letter',
            content: letter,
            timestamp: i.timestamp,
            recipient: i.recipient,
            occasion: i.occasion,
          })
        }
      })

    // 添加示例文章 - 使用固定时间戳避免 SSR/CSR 不一致
    // 只在客户端添加示例文章
    const now = mounted ? Date.now() : 1704067200000 // 固定时间戳作为 SSR 时的默认值
    const examples: Article[] = [
      {
        id: 'example-story-1',
        title: "The Brave Little Dragon",
        author: "libraryman",
        type: 'story',
        content: `Once upon a time, there was a little dragon named Sparkle who was afraid of fire. All the other dragons laughed at him because dragons are supposed to breathe fire, but Sparkle couldn't.

One day, Sparkle found a lost kitten in the forest. The kitten was cold and scared. Sparkle wanted to help, but he didn't know how. Suddenly, he felt a warm feeling in his belly. It was his first fire! He breathed a gentle flame to keep the kitten warm.

The other dragons saw how brave Sparkle was and stopped laughing. Sparkle learned that being different is okay, and helping others is what truly makes you brave.`,
        timestamp: now - 86400000, // 1 day ago
      },
      {
        id: 'example-review-1',
        title: "Book Review: The Magic Treehouse",
        author: "libraryman",
        type: 'bookReview',
        content: `The Magic Treehouse is an amazing adventure book! Jack and Annie discover a magical treehouse filled with books. When they point to a picture in a book, the treehouse spins and takes them to that place!

I loved reading about their adventures in ancient Egypt and meeting mummies. The book is exciting and teaches you about history too. I recommend this book to kids who love adventure and magic!`,
        timestamp: now - 172800000, // 2 days ago
        bookTitle: "The Magic Treehouse",
      },
      {
        id: 'example-letter-1',
        title: "Letter to Grandma",
        author: "libraryman",
        type: 'letter',
        content: `Dear Grandma,

Hello! How are you? I miss you so much!

I'm writing to tell you about my summer vacation. I went to the beach with my family and built the biggest sandcastle ever! We found so many pretty shells.

I hope to see you soon! Thank you for the birthday present you sent me. I love it!

Love,
Emma`,
        timestamp: now - 259200000, // 3 days ago
        recipient: "Grandma",
        occasion: "Sharing summer news",
      },
    ]

    return [...articles, ...examples].sort((a, b) => b.timestamp - a.timestamp)
  }

  const articles = extractArticles()

  const groupedArticles = articles.reduce((acc, article) => {
    if (!acc[article.type]) {
      acc[article.type] = []
    }
    acc[article.type].push(article)
    return acc
  }, {} as Record<ArticleType, Article[]>)

  const toggleArticle = (id: string) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const formatDate = (timestamp: number) => {
    if (!mounted) return '' // 避免 SSR/CSR 不一致
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden" data-stage="gallery">
      {/* 深色神秘背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/library.png')] opacity-20 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-purple-900/40 to-indigo-900/60"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* 返回编辑按钮 - 只在从编辑页面进入时显示 */}
      {fromEdit && onBackToEdit && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={onBackToEdit}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-xl py-3 px-6 text-lg font-bold rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Editing
          </Button>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12" style={{ paddingTop: '120px' }}>
        {/* 介绍区域 - 包含 Mnemosyne 女神图片 */}
        <div className="mb-12 bg-gradient-to-br from-slate-800/90 via-purple-900/80 to-indigo-900/90 rounded-3xl p-8 border-2 border-purple-700/50 shadow-2xl backdrop-blur-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* 左侧：介绍文字 */}
            <div>
              <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                Mnemosyne's Gallery
              </h1>
              <p className="text-purple-200 text-lg mb-4 leading-relaxed">
                Welcome to the sacred library of memory, where every story, review, and letter written by our young authors is carefully preserved.
              </p>
              <div className="space-y-3 text-purple-300">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <p className="text-sm"><strong className="text-yellow-400">Mnemosyne</strong> was the Greek goddess of memory, mother of the Muses. Here, her wisdom guides us to remember and cherish every creative work.</p>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <p className="text-sm">Browse through the <strong className="text-yellow-400">Stories</strong>, <strong className="text-yellow-400">Book Reviews</strong>, and <strong className="text-yellow-400">Letters</strong> created by students, each one a treasure of imagination.</p>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <p className="text-sm">Click on any category below to explore the writings. Each piece tells a unique story from a young author's heart.</p>
                </div>
              </div>
            </div>

            {/* 右侧：Mnemosyne 女神图片 */}
            <div className="relative h-96 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl">
              <Image
                src="/libraryMan.png"
                alt="Mnemosyne, Goddess of Memory"
                fill
                className="object-contain opacity-90"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.3))',
                }}
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-amber-300 text-sm font-semibold italic">Mnemosyne - Goddess of Memory</p>
              </div>
            </div>
          </div>
        </div>

        {/* 文章分类 */}
        <div className="space-y-6">
          {/* Story 分类 */}
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl border-2 border-purple-700/50 shadow-xl overflow-hidden">
            <button
              onClick={() => setSelectedType(selectedType === 'story' ? null : 'story')}
              className="w-full p-6 flex items-center justify-between hover:bg-purple-900/30 transition-all"
            >
              <div className="flex items-center gap-4">
                {selectedType === 'story' ? (
                  <ChevronDown className="w-6 h-6 text-yellow-400" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-yellow-400" />
                )}
                <Book className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold text-yellow-400">Stories</h2>
                <span className="text-purple-300 text-sm bg-purple-900/50 px-3 py-1 rounded-full">
                  {groupedArticles.story?.length || 0}
                </span>
              </div>
            </button>

            {selectedType === 'story' && (
              <div className="p-6 pt-0 space-y-4 max-h-[600px] overflow-y-auto">
                {groupedArticles.story?.length ? (
                  groupedArticles.story.map((article) => (
                    <div
                      key={article.id}
                      className="bg-slate-900/60 rounded-xl p-5 border border-purple-700/30 hover:border-yellow-500/50 transition-all"
                    >
                      <button
                        onClick={() => toggleArticle(article.id)}
                        className="w-full text-left flex items-center justify-between mb-2"
                      >
                        <div>
                          <h3 className="text-xl font-bold text-yellow-300 mb-1">{article.title}</h3>
                          <p className="text-purple-300 text-sm">by {article.author} • {formatDate(article.timestamp) || 'Loading...'}</p>
                        </div>
                        {expandedArticles.has(article.id) ? (
                          <ChevronDown className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-yellow-400" />
                        )}
                      </button>
                      {expandedArticles.has(article.id) && (
                        <div className="mt-4 p-4 bg-slate-950/60 rounded-lg border border-purple-800/30">
                          <pre className="text-purple-100 whitespace-pre-wrap text-sm leading-relaxed font-serif">
                            {article.content}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-purple-400 text-center py-8">No stories yet. Students' creative tales will appear here!</p>
                )}
              </div>
            )}
          </div>

          {/* Book Review 分类 */}
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl border-2 border-indigo-700/50 shadow-xl overflow-hidden">
            <button
              onClick={() => setSelectedType(selectedType === 'bookReview' ? null : 'bookReview')}
              className="w-full p-6 flex items-center justify-between hover:bg-indigo-900/30 transition-all"
            >
              <div className="flex items-center gap-4">
                {selectedType === 'bookReview' ? (
                  <ChevronDown className="w-6 h-6 text-blue-400" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-blue-400" />
                )}
                <FileText className="w-8 h-8 text-blue-400" />
                <h2 className="text-2xl font-bold text-blue-400">Book Reviews</h2>
                <span className="text-indigo-300 text-sm bg-indigo-900/50 px-3 py-1 rounded-full">
                  {groupedArticles.bookReview?.length || 0}
                </span>
              </div>
            </button>

            {selectedType === 'bookReview' && (
              <div className="p-6 pt-0 space-y-4 max-h-[600px] overflow-y-auto">
                {groupedArticles.bookReview?.length ? (
                  groupedArticles.bookReview.map((article) => (
                    <div
                      key={article.id}
                      className="bg-slate-900/60 rounded-xl p-5 border border-indigo-700/30 hover:border-blue-500/50 transition-all"
                    >
                      <button
                        onClick={() => toggleArticle(article.id)}
                        className="w-full text-left flex items-center justify-between mb-2"
                      >
                        <div>
                          <h3 className="text-xl font-bold text-blue-300 mb-1">{article.title}</h3>
                          <p className="text-indigo-300 text-sm">by {article.author} • {formatDate(article.timestamp) || 'Loading...'}</p>
                        </div>
                        {expandedArticles.has(article.id) ? (
                          <ChevronDown className="w-5 h-5 text-blue-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-blue-400" />
                        )}
                      </button>
                      {expandedArticles.has(article.id) && (
                        <div className="mt-4 space-y-3">
                          {article.coverUrl && (
                            <div className="relative w-32 h-48 mx-auto rounded-lg overflow-hidden border-2 border-indigo-600/50">
                              <Image
                                src={article.coverUrl}
                                alt={article.bookTitle || "Book cover"}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )}
                          <div className="p-4 bg-slate-950/60 rounded-lg border border-indigo-800/30">
                            <pre className="text-indigo-100 whitespace-pre-wrap text-sm leading-relaxed font-serif">
                              {article.content}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-indigo-400 text-center py-8">No book reviews yet. Students' thoughtful reviews will appear here!</p>
                )}
              </div>
            )}
          </div>

          {/* Letter 分类 */}
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl border-2 border-pink-700/50 shadow-xl overflow-hidden">
            <button
              onClick={() => setSelectedType(selectedType === 'letter' ? null : 'letter')}
              className="w-full p-6 flex items-center justify-between hover:bg-pink-900/30 transition-all"
            >
              <div className="flex items-center gap-4">
                {selectedType === 'letter' ? (
                  <ChevronDown className="w-6 h-6 text-pink-400" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-pink-400" />
                )}
                <Mail className="w-8 h-8 text-pink-400" />
                <h2 className="text-2xl font-bold text-pink-400">Letters</h2>
                <span className="text-pink-300 text-sm bg-pink-900/50 px-3 py-1 rounded-full">
                  {groupedArticles.letter?.length || 0}
                </span>
              </div>
            </button>

            {selectedType === 'letter' && (
              <div className="p-6 pt-0 space-y-4 max-h-[600px] overflow-y-auto">
                {groupedArticles.letter?.length ? (
                  groupedArticles.letter.map((article) => (
                    <div
                      key={article.id}
                      className="bg-slate-900/60 rounded-xl p-5 border border-pink-700/30 hover:border-pink-500/50 transition-all"
                    >
                      <button
                        onClick={() => toggleArticle(article.id)}
                        className="w-full text-left flex items-center justify-between mb-2"
                      >
                        <div>
                          <h3 className="text-xl font-bold text-pink-300 mb-1">{article.title}</h3>
                          {article.occasion && (
                            <p className="text-pink-400 text-xs mb-1">{article.occasion}</p>
                          )}
                          <p className="text-pink-300 text-sm">by {article.author} • {formatDate(article.timestamp) || 'Loading...'}</p>
                        </div>
                        {expandedArticles.has(article.id) ? (
                          <ChevronDown className="w-5 h-5 text-pink-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-pink-400" />
                        )}
                      </button>
                      {expandedArticles.has(article.id) && (
                        <div className="mt-4 p-4 bg-slate-950/60 rounded-lg border border-pink-800/30">
                          <pre className="text-pink-100 whitespace-pre-wrap text-sm leading-relaxed font-serif" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                            {article.content}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-pink-400 text-center py-8">No letters yet. Students' heartfelt letters will appear here!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

