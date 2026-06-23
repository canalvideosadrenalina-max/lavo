import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const TIPOS = [
  { slug: "lavagem-externa", nome: "Lavagem externa", categoria: "Outros", descricao: "Limpeza da parte externa do veículo", ordem: 1 },
  { slug: "lavagem-interna", nome: "Lavagem interna", categoria: "Outros", descricao: "Limpeza do interior do veículo", ordem: 2 },
  { slug: "lavagem-embaixo", nome: "Lavagem embaixo", categoria: "Outros", descricao: "Limpeza da parte inferior do veículo", ordem: 3 },
  { slug: "lavagem-em-cima", nome: "Lavagem em cima", categoria: "Outros", descricao: "Limpeza do capô e teto", ordem: 4 },
  { slug: "aspiracao", nome: "Aspiração", categoria: "Outros", descricao: "Aspiração de carpetes e bancos", ordem: 5 },
  { slug: "troca-oleo", nome: "Troca de óleo", categoria: "Outros", descricao: "Troca de óleo do motor", ordem: 6 },
  { slug: "enceramento", nome: "Enceramento", categoria: "Outros", descricao: "Aplicação de cera protetora", ordem: 7 },
  { slug: "higienizacao", nome: "Higienização", categoria: "Outros", descricao: "Higienização completa interna", ordem: 8 },
];

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  for (const tipo of TIPOS) {
    await prisma.tipoServico.upsert({
      where: { slug: tipo.slug },
      update: { nome: tipo.nome, descricao: tipo.descricao, ordem: tipo.ordem, categoria: tipo.categoria },
      create: tipo,
    });
  }

  console.log(`Seed OK: ${TIPOS.length} tipos de serviço`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
