# SCMS — Canvas Workspace

Internal Stock & Consumable Management System. See `docs/PRD.md` for full
requirements and `CLAUDE.md` for build instructions (Claude Code reads this
automatically when working in this folder).

## First-time setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Create your Supabase project** at supabase.com, then copy `.env.example`
   to `.env` and fill in your project URL + anon key (Project Settings → API).

3. **Run the schema migration** — either via Supabase CLI:
   ```
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
   or by pasting the contents of `supabase/migrations/0001_init_schema.sql`
   into the Supabase Dashboard's SQL Editor and running it.

4. **Create your first users** via Supabase Dashboard → Authentication → Add
   User (create one admin and one CEM manually for initial testing), then
   insert matching rows into `profiles` with the correct `id` (matches
   `auth.users.id`) and `role`.

5. **Seed test data (optional)** — run `supabase/seed.sql` after step 4, using
   your real user IDs where noted in the file's comments.

6. **Run the app**
   ```
   npm run dev
   ```

## Folder structure
```
scms/
├── CLAUDE.md                 # Claude Code reads this first, every session
├── docs/
│   └── PRD.md                 # Full product requirements
├── public/
│   └── logo.png                # Canvas Workspace logo
├── src/
│   ├── lib/
│   │   └── supabaseClient.ts   # Supabase client (already wired to .env)
│   ├── styles/
│   │   └── globals.css         # Tailwind entry point
│   ├── App.tsx                 # Root component (placeholder — build starts here)
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   │   └── 0001_init_schema.sql  # Full schema + RLS (already written)
│   └── seed.sql                # Local test data
├── .env.example
├── tailwind.config.ts          # Canvas brand color (#6500D6) pre-configured
├── package.json
└── vite.config.ts
```
