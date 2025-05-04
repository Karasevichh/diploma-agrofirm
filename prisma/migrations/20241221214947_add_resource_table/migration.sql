-- CreateTable
CREATE TABLE "Resource" (
    "id" SERIAL NOT NULL,
    "equipment" TEXT NOT NULL,
    "workers" INTEGER NOT NULL,
    "task" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);
