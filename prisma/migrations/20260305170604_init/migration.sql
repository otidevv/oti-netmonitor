-- CreateTable
CREATE TABLE "access_points" (
    "id" TEXT NOT NULL,
    "ap" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "mac" TEXT NOT NULL,
    "codPatrimonial" TEXT NOT NULL,
    "pabellon" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "nombreSenal" TEXT NOT NULL,
    "densidadSenal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mediciones" (
    "id" TEXT NOT NULL,
    "accessPointId" TEXT NOT NULL,
    "pingImage" TEXT NOT NULL,
    "speedImage" TEXT NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mediciones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mediciones" ADD CONSTRAINT "mediciones_accessPointId_fkey" FOREIGN KEY ("accessPointId") REFERENCES "access_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;
