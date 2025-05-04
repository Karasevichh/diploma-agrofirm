-- CreateTable
CREATE TABLE "Harvest" (
    "id" SERIAL NOT NULL,
    "crop" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "yield" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Harvest_pkey" PRIMARY KEY ("id")
);
