/**
 * Backfill avaliacao_google from scripts/prospects-validados.json
 * Usage: node scripts/backfill-ratings.js
 */
const { config } = require("dotenv");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

config({ path: path.join(__dirname, "..", ".env.local") });

const PROSPECTS_FILE = path.join(__dirname, "prospects-validados.json");

async function main() {
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL/DIRECT_URL não definido");
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });
  const prospects = JSON.parse(fs.readFileSync(PROSPECTS_FILE, "utf8"));

  let updated = 0;
  for (const prospect of prospects) {
    if (!prospect.rating) continue;
    const nota = parseFloat(prospect.rating);
    if (Number.isNaN(nota)) continue;

    const result = await prisma.lavaJato.updateMany({
      where: { nome: prospect.nome, avaliacaoGoogle: null },
      data: { avaliacaoGoogle: nota },
    });

    if (result.count > 0) {
      updated += result.count;
      console.log(`✓ ${prospect.nome} → ${nota}`);
    }
  }

  console.log(`\nAtualizados: ${updated}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
