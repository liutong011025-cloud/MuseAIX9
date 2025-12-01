import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type') // 'story', 'review', 'letter', or 'all'

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const result: {
      stories?: any[]
      reviews?: any[]
      letters?: any[]
    } = {}

    // 获取故事
    if (!type || type === 'all' || type === 'story') {
      const stories = await prisma.story.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          interactions: {
            select: {
              id: true,
              timestamp: true,
            },
          },
        },
      })
      result.stories = stories.map(story => ({
        id: story.id,
        interactionId: story.interactionId,
        character: story.character,
        plot: story.plot,
        structure: story.structure,
        content: story.content,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
        timestamp: story.interactions?.timestamp,
      }))
    }

    // 获取书评
    if (!type || type === 'all' || type === 'review') {
      const reviews = await prisma.review.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          interactions: {
            select: {
              id: true,
              timestamp: true,
            },
          },
        },
      })
      result.reviews = reviews.map(review => ({
        id: review.id,
        interactionId: review.interactionId,
        reviewType: review.reviewType,
        bookTitle: review.bookTitle,
        bookCoverUrl: review.bookCoverUrl,
        bookSummary: review.bookSummary,
        structure: review.structure,
        content: review.content,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        timestamp: review.interactions?.timestamp,
      }))
    }

    // 获取信件
    if (!type || type === 'all' || type === 'letter') {
      const letters = await prisma.letter.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          interactions: {
            select: {
              id: true,
              timestamp: true,
            },
          },
        },
      })
      result.letters = letters.map(letter => ({
        id: letter.id,
        interactionId: letter.interactionId,
        recipient: letter.recipient,
        occasion: letter.occasion,
        guidance: letter.guidance,
        readerImageUrl: letter.readerImageUrl,
        sections: letter.sections,
        content: letter.content,
        createdAt: letter.createdAt,
        updatedAt: letter.updatedAt,
        timestamp: letter.interactions?.timestamp,
      }))
    }

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Get user works error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

