import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // 从数据库查询用户
    const user = await prisma.user.findUnique({
      where: { username },
    })
    
    if (user && user.password === password) {
      // 用户存在且密码正确
      return NextResponse.json({
        success: true,
        user: {
          username: user.username,
          role: user.role as 'teacher' | 'student',
          noAi: user.noAi || false, // 标记是否为无AI版本
        },
      })
    }

    // 用户名或密码错误
    return NextResponse.json(
      { success: false, error: 'Invalid username or password' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

