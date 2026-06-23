# Plano RLS — Supabase Postgres

**Status:** documentado (não implementado)  
**Data:** 2026-06-23

## Contexto

Hoje o LaVo usa **Prisma com connection string direta** (service role equivalente no app server). Row Level Security (RLS) no Supabase **não protege** queries Prisma enquanto a conexão usar credenciais com bypass de RLS.

RLS passa a valer quando:
- Clientes Supabase no browser usam `anon` key + JWT do usuário
- Edge functions / RPC usam `authenticated` role

## Objetivo futuro

Isolar dados por usuário sem depender só de checks em server actions.

## Tabelas e políticas propostas

### `users`
| Operação | Política |
|----------|----------|
| SELECT | `auth.uid() = id` |
| UPDATE | `auth.uid() = id` (campos limitados: nome, telefone) |

### `lava_jatos`
| Operação | Política |
|----------|----------|
| SELECT | `status = 'ATIVO' AND disponivel_agora = true` **OU** `owner_id = auth.uid()` |
| INSERT | `auth.uid() = owner_id` |
| UPDATE | `owner_id = auth.uid()` |

### `agendamentos`
| Operação | Política |
|----------|----------|
| SELECT | `cliente_id = auth.uid()` **OU** lava-jato pertence ao dono |
| INSERT | `cliente_id = auth.uid()` |
| UPDATE | dono confirma/cancela **OU** cliente cancela próprio |

### `otp_codes`
| Operação | Política |
|----------|----------|
| ALL | **Negar** acesso direto — somente server-side (Prisma/service role) |

## Migração sugerida (fases)

1. **Auditoria** — listar todas as queries Prisma e mapear para políticas
2. **Habilitar RLS** nas tabelas com política `DENY ALL` para `anon` (sem quebrar Prisma se usar `service_role` apenas no server)
3. **Supabase client no browser** — migrar leituras públicas (lista ATIVO) para PostgREST com RLS
4. **Testes** — usuário A não vê agendamentos de B; dono só vê seu lava-jato
5. **Remover** checks redundantes em actions após validação E2E

## Riscos

- Prisma + RLS exige connection string com role correto por contexto
- Policies mal escritas podem bloquear triggers (`auth.users` → `public.users`)
- Performance: índices em `owner_id`, `cliente_id`, `lavajato_id`

## Referências

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Skill local: `.agents/skills/supabase-postgres-best-practices/references/security-rls-basics.md`
