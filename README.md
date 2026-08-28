# 3B Movement | Contact Enricher

Internal tool for matching segmented member lists against a master contact CSV. Matching runs in the browser. Do not deploy member data to a public host.

## Local

```bash
npm install
npm run dev
```

Open http://localhost:5173/

Dummy files: `public/samples/`. Do not commit real member CSVs.

## Supabase

1. Create a private project.
2. Run `supabase/schema.sql` in the SQL Editor.
3. Copy the project URL and **anon** key (never the service_role key).
4. Add them in **Settings**, or copy `.env.example` to `.env`.

Saving a run is optional and stores the enriched segment rows.

## Stack

Vite, React, TypeScript, Papa Parse, Supabase JS.
