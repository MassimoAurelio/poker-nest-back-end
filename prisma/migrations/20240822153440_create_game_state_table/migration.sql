-- CreateTable
CREATE TABLE "GameState" (
    "roomId" VARCHAR NOT NULL,
    "roundStarted" BOOLEAN NOT NULL DEFAULT false,
    "waitingForPlayers" INTEGER NOT NULL DEFAULT 0,
    "timerStart" TIMESTAMP(6),

    CONSTRAINT "GameState_pkey" PRIMARY KEY ("roomId")
);
