# Shelter check-in

Next.js + Supabase: public kiosk at `/`, staff area at `/staff/*`.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (Supabase → Project Settings → API).
- Supabase → Authentication → Providers: turn on **Email**, allow sign-ups if staff should create accounts, and adjust **Confirm email** (off is easiest for local dev).
- Supabase → Authentication → URL configuration: add redirect URL `http://localhost:3000/auth/callback` (and production when deployed).
- Supabase → SQL editor: run `00001_mood_entries.sql` on a fresh DB, then `00002_mood_entries_survey_columns.sql` to extend `mood_entries`, then `00003_claim_shelter_access_disambiguate.sql` (fixes ambiguous `shelter_id` in `claim_shelter_access` for existing DBs).
- Seed at least one shelter, e.g.:

```sql
insert into public.shelters (name, access_code)
values ('Main campus', 'your-secret-code');
```

## Project layout

| Path | Purpose |
| --- | --- |
| `src/app/(kiosk)/` | Public kiosk UI |
| `src/app/(staff)/staff/` | Staff routes (middleware protects except `/staff/login`) |
| `src/app/auth/callback/route.ts` | Auth callback (OAuth / PKCE) |
| `src/middleware.ts` | Session refresh; gate `/staff/*` |
| `src/lib/supabase/` | Browser and server Supabase clients |
| `supabase/migrations/` | SQL schema |

## Database schema

**`shelters`**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | |
| `access_code` | `text` | `not null`, `unique` |

**`mood_entries`** (after `00001` + `00002`)

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `shelter_id` | `uuid` | FK → `shelters(id)`, `on delete cascade` |
| `mood_level` | `int[]` | `not null`; multiselect moods, each value 1–5 |
| `created_at` | `timestamptz` | `not null`, default `now()` |
| `short_survey_completed` | `boolean` | `not null`, default `false` |
| `long_survey_completed` | `boolean` | `not null`, default `false` |
| `sq1_answer` … `sq3_answer` | `int[]` | nullable; short Q1–Q3 multiselect (e.g. option indices) |
| `lq1_answer` … `lq6_answer` | `int[]` | nullable; long Q1–Q6 multiselect |

Index: `(shelter_id, created_at desc)`.

**`user_shelter_access`**

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | `uuid` | FK → `auth.users(id)`, `on delete cascade` |
| `shelter_id` | `uuid` | FK → `shelters(id)`, `on delete cascade` |
| | | PK `(user_id, shelter_id)` |

**RPCs** (see migration for definitions)

| Name | Called by | Role |
| --- | --- | --- |
| `validate_kiosk_access` | Kiosk | `anon`, `authenticated` |
| `submit_mood_checkin` | Kiosk | `anon`, `authenticated` |
| `claim_shelter_access` | Staff UI | `authenticated` |

**RLS** (all three tables enabled)

- **`shelters`**: `authenticated` can `select` rows for shelters unlocked in `user_shelter_access`.
- **`user_shelter_access`**: `authenticated` can `select` own rows (`user_id = auth.uid()`).
- **`mood_entries`**: `authenticated` can `select` rows whose `shelter_id` is unlocked for them. Inserts use `submit_mood_checkin` (security definer); survey fields are intended to be updated via server/RPC when wired from the app.
