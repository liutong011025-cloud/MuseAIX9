// 数据库初始化脚本
// 用于将现有用户数据导入数据库

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 用户数据（从 app/api/auth/route.ts 复制）
const USERS = {
  // 教师账户
  'Nicole': { password: 'yinyin2948', role: 'teacher' as const },
  
  // 正常AI用户（密码：123321）
  'Stark': { password: '123321', role: 'student' as const },
  'Banner': { password: '123321', role: 'student' as const },
  'Rogers': { password: '123321', role: 'student' as const },
  'Parker': { password: '123321', role: 'student' as const },
  'Romanoff': { password: '123321', role: 'student' as const },
  'Barton': { password: '123321', role: 'student' as const },
  'Odinson': { password: '123321', role: 'student' as const },
  'Maximoff': { password: '123321', role: 'student' as const },
  'Lang': { password: '123321', role: 'student' as const },
  'Strange': { password: '123321', role: 'student' as const },
  'Fury': { password: '123321', role: 'student' as const },
  'Groot': { password: '123321', role: 'student' as const },
  'Rocket': { password: '123321', role: 'student' as const },
  'Quill': { password: '123321', role: 'student' as const },
  'Drax': { password: '123321', role: 'student' as const },
  'Gamora': { password: '123321', role: 'student' as const },
  'Thanos': { password: '123321', role: 'student' as const },
  'Loki': { password: '123321', role: 'student' as const },
  'halk': { password: '123321', role: 'student' as const },
  
  // 非AI用户（密码：123321，noAi: true）
  'Wayne': { password: '123321', role: 'student' as const, noAi: true },
  'Kent': { password: '123321', role: 'student' as const, noAi: true },
  'Queen': { password: '123321', role: 'student' as const, noAi: true },
  'Allen': { password: '123321', role: 'student' as const, noAi: true },
  'Barbara': { password: '123321', role: 'student' as const, noAi: true },
  'Diana': { password: '123321', role: 'student' as const, noAi: true },
  'Selina': { password: '123321', role: 'student' as const, noAi: true },
  'Lex': { password: '123321', role: 'student' as const, noAi: true },
  'Luthor': { password: '123321', role: 'student' as const, noAi: true },
  'Zod': { password: '123321', role: 'student' as const, noAi: true },
}

async function main() {
  console.log('开始初始化数据库...')

  // 清空现有用户（可选，根据需要决定）
  // await prisma.user.deleteMany({})

  // 导入用户
  for (const [username, userData] of Object.entries(USERS)) {
    try {
      const user = await prisma.user.upsert({
        where: { username },
        update: {
          password: userData.password,
          role: userData.role,
          noAi: (userData as any).noAi || false,
        },
        create: {
          username,
          password: userData.password,
          role: userData.role,
          noAi: (userData as any).noAi || false,
        },
      })
      console.log(`✓ 用户 ${username} 已创建/更新`)
    } catch (error) {
      console.error(`✗ 创建用户 ${username} 失败:`, error)
    }
  }

  console.log('数据库初始化完成！')
}

main()
  .catch((e) => {
    console.error('初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



