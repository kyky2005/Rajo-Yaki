# Deploy Rojo-Yaki to Vercel

## Vercel project settings

- Framework preset: **Next.js**
- Root directory: repository root
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: leave empty
- Node.js version: **24.x**

## Required environment variable

Add `SUPABASE_DATABASE_URL` to the Production, Preview, and Development
environments in Vercel. Use the Supabase transaction-pooler connection string
from **Supabase Dashboard → Connect → ORMs**.

Do not expose this value with a `NEXT_PUBLIC_` prefix.

## Database initialization

The server creates the required PostgreSQL tables on the first `/pos-api`
request and inserts the preserved Rojo-Yaki starter data only when each record
does not already exist. Later deployments do not overwrite inventory,
transactions, or settings.

The checkout path uses a PostgreSQL transaction, row locks, and an advisory lock
so stock deductions and receipt numbers remain consistent.
