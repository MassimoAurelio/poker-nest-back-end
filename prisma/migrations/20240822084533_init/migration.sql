-- CreateEnum
CREATE TYPE "RoundStage" AS ENUM ('preflop', 'flop', 'turn', 'river');

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roomId" TEXT,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reg_users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "reg_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "stack" INTEGER,
    "position" INTEGER,
    "roomId" TEXT NOT NULL,
    "isDealer" BOOLEAN NOT NULL DEFAULT false,
    "currentPlayerId" BOOLEAN NOT NULL DEFAULT false,
    "fold" BOOLEAN NOT NULL DEFAULT false,
    "lastBet" INTEGER NOT NULL DEFAULT 0,
    "preFlopLastBet" INTEGER NOT NULL DEFAULT 0,
    "flopLastBet" INTEGER NOT NULL DEFAULT 0,
    "turnLastBet" INTEGER NOT NULL DEFAULT 0,
    "riverLastBet" INTEGER NOT NULL DEFAULT 0,
    "makeTurn" BOOLEAN NOT NULL DEFAULT false,
    "allIn" BOOLEAN,
    "allInColl" BOOLEAN,
    "loser" BOOLEAN NOT NULL DEFAULT false,
    "winner" BOOLEAN NOT NULL DEFAULT false,
    "roundStage" "RoundStage" NOT NULL DEFAULT 'preflop',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cards" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reg_users_username_key" ON "reg_users"("username");

-- CreateIndex
CREATE INDEX "users_roomId_idx" ON "users"("roomId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
