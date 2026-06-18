-- DropForeignKey
ALTER TABLE "agendamentos" DROP CONSTRAINT "agendamentos_servico_id_fkey";

-- AlterTable
ALTER TABLE "agendamentos" DROP COLUMN "servico_id",
ADD COLUMN     "duracao_total_min" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "preco_total_centavos" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'CONFIRMADO';

ALTER TABLE "agendamentos" ALTER COLUMN "duracao_total_min" DROP DEFAULT;
ALTER TABLE "agendamentos" ALTER COLUMN "preco_total_centavos" DROP DEFAULT;

-- AlterTable
ALTER TABLE "servicos" DROP COLUMN "nome",
ADD COLUMN     "tipo_servico_id" TEXT;

-- CreateTable
CREATE TABLE "tipos_servico" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tipos_servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamento_servicos" (
    "id" TEXT NOT NULL,
    "agendamento_id" TEXT NOT NULL,
    "servico_id" TEXT NOT NULL,
    "preco_centavos" INTEGER NOT NULL,
    "duracao_min" INTEGER NOT NULL,

    CONSTRAINT "agendamento_servicos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_servico_slug_key" ON "tipos_servico"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "agendamento_servicos_agendamento_id_servico_id_key" ON "agendamento_servicos"("agendamento_id", "servico_id");

-- CreateIndex
CREATE UNIQUE INDEX "servicos_lavajato_id_tipo_servico_id_key" ON "servicos"("lavajato_id", "tipo_servico_id");

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_tipo_servico_id_fkey" FOREIGN KEY ("tipo_servico_id") REFERENCES "tipos_servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento_servicos" ADD CONSTRAINT "agendamento_servicos_agendamento_id_fkey" FOREIGN KEY ("agendamento_id") REFERENCES "agendamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento_servicos" ADD CONSTRAINT "agendamento_servicos_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "servicos" ALTER COLUMN "tipo_servico_id" SET NOT NULL;
