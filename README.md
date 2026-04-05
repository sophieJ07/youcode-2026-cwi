# Flourish: Wellness Check-In

<p align="center">
  <img src="public/assets/images/flourish.png" alt="Flourish logo" width="112" height="112" />
</p>

**A system that turns emotional load into practical support, where being *seen* comes before being “educated.”**

## Summary

**Flourish: Wellness Check-In** is a deployed multi-language web app for designed to improve the wellbeing of women's shelter residents. Residents use a public **kiosk / tablet** to log mood (and optional short or long wellness surveys responses) anytime during the day. The responses are **anonymous**. Shelter staff sign in separately and view **live aggregated insights** so teams can spot patterns and plan programming accordingly. The system is ready for use in all women's shelter in British Columbia. 

The stack is **Next.js** + **next-intl** and **Supabase** (Postgres, Auth, RLS). 

## User Flow & Features Overview 

**For residents (shared tablet or kiosk)**  
- Staff opens **Flourish: Wellness Check-In** and enter the site's **access code**.
- Residents visit the tablet throughout their day and tap how they're feeling using **six mood options**, then choose whether to add a little more: a **short** wellness follow-up (3 questions), a **longer** long term check-in(3 questions), or to skip straight to done. All questions are skippable.
- The whole flow is available in **several languages**, particularly the most common ones in the synthetic resident dataset provided in the case. 
- All responses are anonymous. 

**For shelter staff**  
- Staff **sign in with email** the way they would any work app.
- Staff enters the same **shelter access code** their site uses so the system knows which location(s) they’re allowed to see.
- The **insights dashboard** provides two big picture views: 
  - **Short-term** views show **the last hour**, **the last six hours**, or **today**: how moods are spread out, and summaries of the **short** survey when people answered it. Staff can turn on an AI mode for **AI-generated activity ideas** inspired by recent patterns. 
  - **Long-term** views look at **the last week** or **the last two weeks** for check-ins that included the **long** survey. Residents' experience related to each of **Mind, Body, and Soul** are laid out with visuals.

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
