-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
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

-- CreateTable
CREATE TABLE "SignalTarget" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "SignalTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseKey" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LicenseKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statistic" (
    "id" TEXT NOT NULL,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "winTrades" INTEGER NOT NULL DEFAULT 0,
    "lossTrades" INTEGER NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL DEFAULT 'ALL',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statistic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseKey_code_key" ON "LicenseKey"("code");

-- CreateIndex
CREATE INDEX "SignalTarget_signalId_idx" ON "SignalTarget"("signalId");

-- AddForeignKey
ALTER TABLE "SignalTarget" ADD CONSTRAINT "SignalTarget_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
