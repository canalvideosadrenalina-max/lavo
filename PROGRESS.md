# LAVO — Progresso de deploy

**Produção:** https://lavo.vercel.app (alias: lavo-ashy.vercel.app)  
**Stack:** Next.js, Supabase, Prisma, Tailwind  
**Branch:** `main`

---

## Fase 1 — Service Worker cache (lavo-v2)

**Status:** concluída ✅  
**Data:** 2026-06-23  
**Commit:** `453e640` — `feat(phase-1): fix sw cache lavo-v2`

- [x] Bump `CACHE_NAME` → `lavo-v2`
- [x] Network-first em `/cadastro`, `/login`, `/confirmar-telefone`, `/painel/*`

---

## Fase 2 — Turnstile server-side

**Status:** concluída ✅  
**Data:** 2026-06-23  
**Commit:** `cca5f93` — `feat(phase-2): turnstile server-side`

- [x] `lib/turnstile/verificar-token.ts`
- [x] Validação em `app/cadastro/actions.ts`
- [x] Reset widget em erro no client

---

## Fase 3 — UI polish mobile

**Status:** concluída ✅  
**Data:** 2026-06-23  
**Commit:** `944a2b9` — `feat(phase-3): ui polish mobile`  
**Deploy:** `dpl_4qoNFZgqTFrSvHfFaH2Yjm1hLg6v`

- [x] Transições 200ms em inputs/botões (`globals.css`)
- [x] Login com validação visual igual ao cadastro
- [x] Home cards premium (gradiente, water drop, badge Novo/★)
- [x] Layout mobile 375px (`min-h-dvh`, touch 48px)

---

## Fase 4 — Segurança e repo

**Status:** concluída ✅  
**Data:** 2026-06-23  
**Commit:** `32a1423` — `feat(phase-4): security and env docs`  
**Deploy:** `dpl_29b8dy9Pco6LQmMtMxKoUeY282yX`

- [x] Secrets removidos de `scripts/` → env vars
- [x] `.env.example` + README documentado
- [x] `git push origin main`

---

## Fase 5 — Página /perfil + navegação

**Status:** concluída ✅  
**Data:** 2026-06-23  
**Commit:** `d363416` — `feat(phase-5): profile page and nav`  
**Deploy:** `dpl_CYZp8M3k9vewsP8Jfaz7eCeCeZuB`

- [x] Rota `/perfil` (nome, email, telefone, status confirmação)
- [x] Bottom-nav aponta `/perfil` para clientes logados

---

## Fase 6 — Qualidade e bugs

**Status:** concluída ✅  
**Data:** 2026-06-23  
**Commit:** `8bd4a20` — `feat(phase-6): lint fixes and signup flow`  
**Deploy:** `dpl_9GHZLTpujSxxqCK2wikxw92HFT7A`

- [x] `npm run lint` — OK (scripts ignorados, fix Turnstile reset)
- [x] Cadastro com sessão → redireciona `/confirmar-telefone` (não `/`)
- [x] Build limpo

---

## Fase 7 — Backlog

**Status:** concluída ✅  
**Data:** 2026-06-23  
**Commit:** `8392581` — `feat(phase-7): ratings claim flow and rls plan`  
**Deploy:** `dpl_6FHWL1f7YRJi2zLwPgcHWhjvQvZA`

- [x] Avaliações reais: campo `avaliacao_google` + backfill (33 prospects)
- [x] Claim prospect: `PENDENTE` → `ATIVO`, `disponivelAgora`, CNPJ real
- [x] `docs/RLS-PLAN.md` — plano RLS Supabase documentado
- [x] Migration aplicada em produção

---

## Fase 8 — UX polish (nav, skeletons, toasts, manifest)

**Status:** concluída ✅  
**Data:** 2026-06-23

### Escopo
- [x] Bottom nav com ícones Lucide (`lucide-react`)
- [x] Skeleton loading na home (`CardSkeleton` + Suspense)
- [x] Sonner toasts (`showToast`, `FormWithToast`, actions refatoradas)
- [x] Manifest shortcuts (Buscar, Reservas, Perfil)

---

## Próximos passos (fora do escopo)

- Implementar RLS de fato (ver `docs/RLS-PLAN.md`)
- Alias `lavo.vercel.app` na Vercel (se ainda não apontando)
- Configurar `GOOGLE_MAPS_API_KEY` e `PROSPECT_SYSTEM_PASSWORD` localmente para scripts
