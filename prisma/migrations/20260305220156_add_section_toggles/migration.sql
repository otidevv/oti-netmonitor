-- AlterTable
ALTER TABLE "verificaciones" ADD COLUMN     "seccionAudio" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seccionInternet" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seccionMinipc" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seccionPizarra" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seccionProyector" BOOLEAN NOT NULL DEFAULT true;
