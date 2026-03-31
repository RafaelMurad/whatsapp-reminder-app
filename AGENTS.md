# WhatsApp Reminder App

Schedule reminders delivered via WhatsApp. pnpm monorepo with Next.js frontend, tRPC API, Prisma DB, and background worker.

## Stack

pnpm workspaces. TypeScript throughout.
- `packages/db` — Prisma 6 (SQLite dev, PostgreSQL prod), schema + client singleton
- `packages/api` — tRPC v10 routers, JWT auth, Twilio WhatsApp service
- `apps/web` — Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, tRPC client
- `apps/worker` — Node.js cron job (every minute), sends due reminders via Twilio

Dependency graph: `db` ← `api` ← `web` / `worker`.

## Development

```bash
pnpm install                # install all workspaces
pnpm dev                    # migrates DB, generates Prisma client, starts worker + web
pnpm dev:web                # web only
pnpm dev:worker             # worker only
pnpm --filter db studio     # prisma studio
```

Non-obvious: `pnpm --filter db migrate` for Prisma migrations, `pnpm --filter db generate` after schema changes.

## Conventions

- Workspace packages export raw `.ts` — no build step. Consumers (Next.js, tsx) transpile at runtime.
- `apps/web/next.config.ts` uses `transpilePackages: ["@repo/api", "@repo/db"]`.
- tRPC routers: `auth` (register/login, JWT), `reminder` (CRUD). Context extracts JWT from Bearer header.
- Auth flow: JWT stored in localStorage, injected as Bearer token via tRPC `httpBatchLink` headers.
- Worker creates its own PrismaClient and Twilio client (duplicates `packages/api` service code).
- shadcn/ui (new-york style) in `apps/web/components/ui/`.
- Single `.env` at root — shared by all workspaces. Required: `DATABASE_URL`, `JWT_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`.
