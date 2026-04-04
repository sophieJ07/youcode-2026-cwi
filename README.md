# Shelter check-in (Next.js + Supabase)

Two surfaces on **one Next.js app**: a **public kiosk** at `/` (tablet-friendly guest check-in) and a **staff area** at `/staff/*` (Supabase Auth + dashboard shell). Both use the same Supabase project.

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Add your project URL and anon key from **Supabase → Project Settings → API**.

2. In **Supabase → Authentication → URL configuration**, set **Site URL** to your app origin (e.g. `http://localhost:3000` in development) and add **Redirect URLs**:

   - `http://localhost:3000/auth/callback`
   - (production) `https://your-domain.com/auth/callback`

3. Turn on whichever **Auth providers** you want (email, magic link, OAuth, etc.). The staff sign-in UI adapts to what you enable in the dashboard.

4. Create the shared table and RLS policies by running the SQL in `supabase/migrations/00001_mood_entries.sql` in the Supabase SQL editor (or via the Supabase CLI if you use it). This allows **anonymous** inserts from the kiosk and **authenticated** reads for staff.

5. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   - Kiosk: [http://localhost:3000](http://localhost:3000)
   - Staff login: [http://localhost:3000/staff/login](http://localhost:3000/staff/login)

## Project layout

| Path | Purpose |
| --- | --- |
| `src/app/(kiosk)/` | Public guest UI (no login) |
| `src/app/(staff)/staff/` | Staff routes; middleware protects everything except `/staff/login` |
| `src/app/auth/callback/route.ts` | OAuth / PKCE session exchange |
| `src/middleware.ts` | Session refresh + gate for `/staff/*` |
| `src/lib/supabase/` | Browser and server Supabase clients |
| `supabase/migrations/` | SQL for shared tables |

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
