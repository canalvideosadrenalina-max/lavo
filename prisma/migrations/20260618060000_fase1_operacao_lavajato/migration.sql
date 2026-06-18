-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CPF', 'CNPJ');

-- AlterTable (nullable first for backfill)
ALTER TABLE "lava_jatos" ADD COLUMN IF NOT EXISTS "disponivel_agora" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "lava_jatos" ADD COLUMN IF NOT EXISTS "documento" TEXT;
ALTER TABLE "lava_jatos" ADD COLUMN IF NOT EXISTS "intervalo_slot_min" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "lava_jatos" ADD COLUMN IF NOT EXISTS "razao_social" TEXT;
ALTER TABLE "lava_jatos" ADD COLUMN IF NOT EXISTS "telefone" TEXT;
ALTER TABLE "lava_jatos" ADD COLUMN IF NOT EXISTS "tipo_documento" "TipoDocumento";
ALTER TABLE "lava_jatos" ADD COLUMN IF NOT EXISTS "vagas_simultaneas" INTEGER NOT NULL DEFAULT 1;

UPDATE "lava_jatos"
SET
  "tipo_documento" = COALESCE("tipo_documento", 'CPF'::"TipoDocumento"),
  "documento" = COALESCE("documento", 'legacy-' || "id")
WHERE "documento" IS NULL OR "tipo_documento" IS NULL;

ALTER TABLE "lava_jatos" ALTER COLUMN "documento" SET NOT NULL;
ALTER TABLE "lava_jatos" ALTER COLUMN "tipo_documento" SET NOT NULL;

-- CreateTable
CREATE TABLE "disponibilidade_semanal" (
    "id" TEXT NOT NULL,
    "lavajato_id" TEXT NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "aberto" BOOLEAN NOT NULL DEFAULT true,
    "hora_abertura" TEXT,
    "hora_fechamento" TEXT,
    "tem_almoco" BOOLEAN NOT NULL DEFAULT false,
    "almoco_inicio" TEXT,
    "almoco_fim" TEXT,

    CONSTRAINT "disponibilidade_semanal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "disponibilidade_semanal_lavajato_id_dia_semana_key" ON "disponibilidade_semanal"("lavajato_id", "dia_semana");

-- CreateIndex
CREATE UNIQUE INDEX "lava_jatos_documento_key" ON "lava_jatos"("documento");

-- AddForeignKey
ALTER TABLE "disponibilidade_semanal" ADD CONSTRAINT "disponibilidade_semanal_lavajato_id_fkey" FOREIGN KEY ("lavajato_id") REFERENCES "lava_jatos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
