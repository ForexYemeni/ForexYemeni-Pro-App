import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// إنشاء الجداول تلقائياً عند أول اتصال بقاعدة البيانات
let tablesEnsured = false

export async function ensureDatabase() {
  if (tablesEnsured) return
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL is not set - database operations will fail')
    return
  }

  try {
    console.log('🔄 Checking database tables...')

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Admin" (
          "id" TEXT NOT NULL,
          "username" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
      );
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Signal" (
          "id" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "pair" TEXT NOT NULL,
          "timeframe" TEXT NOT NULL,
          "entryPrice" DOUBLE PRECISION NOT NULL,
          "stopLoss" DOUBLE PRECISION NOT NULL,
          "stopLossType" TEXT NOT NULL DEFAULT 'ATR',
          "riskPercent" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
          "riskAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "lotSize" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "lotType" TEXT NOT NULL DEFAULT '',
          "balance" DOUBLE PRECISION NOT NULL DEFAULT 100,
          "stars" INTEGER NOT NULL DEFAULT 1,
          "mtfTrend" TEXT NOT NULL DEFAULT 'BULLISH',
          "smcStructure" TEXT NOT NULL DEFAULT 'BULLISH',
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "tpReached" INTEGER NOT NULL DEFAULT 0,
          "alertText" TEXT NOT NULL DEFAULT '',
          "alertStyle" TEXT NOT NULL DEFAULT 'normal',
          "tpMode" TEXT NOT NULL DEFAULT 'ATR',
          "planName" TEXT NOT NULL DEFAULT 'ForexYemeni_Gold',
          "contractSize" DOUBLE PRECISION NOT NULL DEFAULT 100,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
      );
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SignalTarget" (
          "id" TEXT NOT NULL,
          "signalId" TEXT NOT NULL,
          "order" INTEGER NOT NULL,
          "price" DOUBLE PRECISION NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
          CONSTRAINT "SignalTarget_pkey" PRIMARY KEY ("id")
      );
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LicenseKey" (
          "id" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "plan" TEXT NOT NULL,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "usedBy" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "LicenseKey_pkey" PRIMARY KEY ("id")
      );
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Statistic" (
          "id" TEXT NOT NULL,
          "totalTrades" INTEGER NOT NULL DEFAULT 0,
          "winTrades" INTEGER NOT NULL DEFAULT 0,
          "lossTrades" INTEGER NOT NULL DEFAULT 0,
          "period" TEXT NOT NULL DEFAULT 'ALL',
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Statistic_pkey" PRIMARY KEY ("id")
      );
    `)

    // إنشاء الفهارس
    try {
      await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Admin_username_key" ON "Admin"("username")`)
      await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "LicenseKey_code_key" ON "LicenseKey"("code")`)
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SignalTarget_signalId_idx" ON "SignalTarget"("signalId")`)
    } catch {
      // الفهارس قد تكون موجودة مسبقاً - لا مشكلة
    }

    // إنشاء العلاقة الخارجية
    try {
      await db.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "SignalTarget" ADD CONSTRAINT "SignalTarget_signalId_fkey"
          FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
      `)
    } catch {
      // قد تكون موجودة
    }

    tablesEnsured = true
    console.log('✅ Database tables ready')
  } catch (error) {
    console.error('❌ Failed to ensure database tables:', error)
    tablesEnsured = false
  }
}
