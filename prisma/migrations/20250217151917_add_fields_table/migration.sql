-- CreateTable
CREATE TABLE "Field" (
    "id" SERIAL NOT NULL,
    "crop" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "yield" DOUBLE PRECISION NOT NULL,
    "plantedAt" TIMESTAMP(3) NOT NULL,
    "coordinates" JSONB NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Field_pkey" PRIMARY KEY ("id")
);
