const { config } = require("dotenv");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { createClient } = require("@supabase/supabase-js");

config({ path: path.join(__dirname, "..", ".env.local") });

const PROSPECTS_FILE = path.join(__dirname, "prospects-validados.json");
const PROSPECT_PASSWORD = "LaVoSistema2025!";

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomSuffix(length = 5) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    suffix += chars[bytes[i] % chars.length];
  }
  return suffix;
}

function buildSlug(nome) {
  const base = slugify(nome) || "lavajato";
  return `${base}-${randomSuffix(5)}`;
}

function padIndex(index) {
  return String(index).padStart(3, "0");
}

function prospectEmail(index) {
  return `prospect-${padIndex(index)}@lavo.sistema.com.br`;
}

async function waitForUserSync(prisma, userId) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const synced = await prisma.user.findUnique({ where: { id: userId } });
    if (synced) {
      return synced.id;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(
    "Usuário criado no auth, mas não sincronizado em public.users (trigger)"
  );
}

async function getOrCreateProspectUser(index, nome, supabase, prisma) {
  const email = prospectEmail(index);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PROSPECT_PASSWORD,
    email_confirm: true,
    user_metadata: {
      nome,
      role: "LAVAJATO",
    },
  });

  if (error) {
    if (
      error.message?.includes("already been registered") ||
      error.message?.includes("already exists")
    ) {
      const { data: listData, error: listError } =
        await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

      if (listError) {
        throw new Error(
          `Usuário ${email} existe no auth mas listUsers falhou: ${listError.message}`
        );
      }

      const authUser = listData.users.find((u) => u.email === email);
      if (!authUser) {
        throw new Error(
          `Usuário ${email} reportado como existente, mas não encontrado no auth`
        );
      }

      return waitForUserSync(prisma, authUser.id);
    }

    throw new Error(`Falha ao criar usuário ${email}: ${error.message}`);
  }

  return waitForUserSync(prisma, data.user.id);
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL não definido em .env.local");
  }
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não definido em .env.local");
  }
  if (!databaseUrl) {
    throw new Error("DATABASE_URL/DIRECT_URL não definido em .env.local");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  const raw = JSON.parse(fs.readFileSync(PROSPECTS_FILE, "utf8"));
  const prospects = raw.filter((r) => r.status === "ATIVO");

  console.log(`Prospects ATIVOS: ${prospects.length}\n`);

  const stats = { inserted: 0, skipped: 0, failed: 0 };

  for (let i = 0; i < prospects.length; i++) {
    const prospect = prospects[i];
    const index = i + 1;
    const label = `[${padIndex(index)}/${padIndex(prospects.length)}] ${prospect.nome}`;

    try {
      const duplicate = await prisma.lavaJato.findFirst({
        where: { nome: prospect.nome },
      });

      if (duplicate) {
        console.log(`${label} — SKIP (já existe: ${duplicate.id})`);
        stats.skipped++;
        continue;
      }

      const ownerId = await getOrCreateProspectUser(
        index,
        prospect.nome,
        supabase,
        prisma
      );

      const documento = `prospect-${padIndex(index)}`;
      const endereco = prospect.endereco?.trim() || prospect.cidade;

      const created = await prisma.lavaJato.create({
        data: {
          ownerId,
          nome: prospect.nome,
          slug: buildSlug(prospect.nome),
          tipoDocumento: "CPF",
          documento,
          endereco,
          cidade: prospect.cidade,
          estado: "RS",
          status: "PENDENTE",
          horaAbertura: "08:00",
          horaFechamento: "18:00",
          intervaloSlotMin: 30,
          vagasSimultaneas: 2,
          disponivelAgora: false,
        },
      });

      console.log(
        `${label} — OK (owner: ${ownerId}, id: ${created.id}, slug: ${created.slug})`
      );
      stats.inserted++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`${label} — ERRO: ${message}`);
      stats.failed++;
    }
  }

  console.log("\n=== RESUMO ===");
  console.log(`Total ATIVOS processados: ${prospects.length}`);
  console.log(`Inseridos: ${stats.inserted}`);
  console.log(`Ignorados (duplicados): ${stats.skipped}`);
  console.log(`Falhas: ${stats.failed}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("\nFalha fatal:", err.message || err);
  process.exit(1);
});
