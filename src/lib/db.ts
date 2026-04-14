import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// على Vercel: نستخدم /tmp لأن نظام الملفات writable هناك
// محلياً: نستخدم المسار الافتراضي
const DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    datasourceUrl: DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
