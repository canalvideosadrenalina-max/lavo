# Lavo

PWA de agendamento de lava-jatos — Next.js, Supabase, Prisma, Tailwind.

**Produção:** https://lavo.vercel.app

## Desenvolvimento

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e configure:

| Variável | Obrigatória | Uso |
|----------|-------------|-----|
| `DATABASE_URL` | Sim | Conexão Prisma (pooler) |
| `DIRECT_URL` | Sim | Migrations / scripts |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | Auth e API Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Client Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Scripts | Admin API (insert prospects) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Prod | Widget captcha |
| `TURNSTILE_SECRET_KEY` | Prod | Validação server-side |
| `EVOLUTION_API_URL` | OTP | WhatsApp Evolution API |
| `EVOLUTION_API_KEY` | OTP | WhatsApp Evolution API |
| `EVOLUTION_INSTANCE` | OTP | Instância Evolution |
| `GOOGLE_MAPS_API_KEY` | Scripts | `scripts/validate-prospects.js` |
| `PROSPECT_SYSTEM_PASSWORD` | Scripts | `scripts/insert-prospects.js` |

Na Vercel, configure as variáveis em **Project → Settings → Environment Variables**.

## Build e deploy

```bash
npm run build
npx vercel --prod --yes
```

## Progresso

Veja `PROGRESS.md` para fases de deploy e roadmap.
