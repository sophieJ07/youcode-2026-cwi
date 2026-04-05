# Shelter check-in (Flourish: Wellness Check-In)

**Principle:** A system that translates invisible emotional load into actionable support.

## Summary

**Flourish: Wellness Check-In** is a multi-language web app for shelter and supportive-housing settings. Guests use a public **kiosk** to log mood and optional short or long wellness surveys—responses stay **anonymous** and are tied only to a shelter access code. Staff sign in separately, unlock their site in Supabase, and view **aggregated insights** (near-real-time and longer windows) so teams can spot patterns and plan programming. The stack is **Next.js**, **Supabase** (Postgres, Auth, RLS), and **next-intl** for the kiosk UI.

## Features overview

### Public kiosk (`/`)

- **Branded flow (“Flourish: Wellness Check-In”)** — guests complete an anonymous check-in on a shared device.
- **Shelter access code** — the code is validated in Supabase before the mood step; tie-in is per shelter.
- **Mood + surveys** — multiselect mood tiles (six levels), optional **short** follow-up (three questions) or **long** follow-up (six questions), with skip/next paths matching the on-screen flow.
- **Languages** — UI strings are loaded with **next-intl** from `messages/*.json` (locale switcher on the kiosk).
- **Persistence** — completed sessions are stored in **`mood_entries`** via the **`submit_kiosk_wellness_checkin`** RPC (security definer, callable with the anon key so kiosk devices do not need staff login).

### Staff area (`/staff/*`)

- **Authentication** — email sign-in; middleware refreshes the session and restricts `/staff/*` (except login).
- **Shelter access** — after login, staff enter the shelter code once to unlock **`claim_shelter_access`**; dashboard data is scoped to shelters linked to their account.
- **Insights dashboard** (`/staff/dashboard`):
  - **Short term** — choose **last hour**, **last six hours**, or **today** (staff time zone); see mood distribution and short-survey aggregates. Optional **Claude**-based activity suggestions when `AI_PROVIDER=claude` and `ANTHROPIC_API_KEY` are set.
  - **Long term** — **last week** or **last two weeks** of check-ins that include the **long** form; Mind / Body / Soul layout with distribution bars, ranked lists, and **mean-based** Likert summaries (stress and community belonging) shown on ring cards.

### Stack

- **Next.js** (App Router), **Supabase** (Postgres, Auth, row-level security), **server actions** for kiosk validation and submission.

## Setup

```bash
cp .env.example .env.local
npm install
npm install next-intl
npm run dev
```

- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (Supabase → Project Settings → API).
- Supabase → Authentication → Providers: turn on **Email**, allow sign-ups if staff should create accounts, and adjust **Confirm email** (off is easiest for local dev).
- Supabase → Authentication → URL configuration: add redirect URL `http://localhost:3000/auth/callback` (and production when deployed).
- Supabase → SQL editor: run SQL in **`supabase/migrations/`** in dependency order: `00001_mood_entries.sql`, `00002_mood_entries_survey_columns.sql`, both `00003_*.sql` files (`claim_shelter_access_disambiguate` and `mood_level_extend_to_6` as needed), `00004_mood_six_levels.sql`, then **`00005_submit_kiosk_wellness_checkin.sql`** for full kiosk submissions.
- **next-intl** is required for kiosk translations (`messages/*.json`).
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
| `mood_level` | `int[]` | `not null`; multiselect moods, each value 1–6 (after `00004`) |
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
| `submit_mood_checkin` | Kiosk (legacy / mood-only) | `anon`, `authenticated` |
| `submit_kiosk_wellness_checkin` | Kiosk (full check-in) | `anon`, `authenticated` |
| `claim_shelter_access` | Staff UI | `authenticated` |

**RLS** (all three tables enabled)

- **`shelters`**: `authenticated` can `select` rows for shelters unlocked in `user_shelter_access`.
- **`user_shelter_access`**: `authenticated` can `select` own rows (`user_id = auth.uid()`).
- **`mood_entries`**: `authenticated` can `select` rows whose `shelter_id` is unlocked for them. Inserts from the kiosk use **`submit_kiosk_wellness_checkin`** or **`submit_mood_checkin`** (both security definer; no direct `insert` policy for anonymous clients).
