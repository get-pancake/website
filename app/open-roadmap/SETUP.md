# Open roadmap — backend setup

The page works with **no backend** (read-only "preview mode" from static seed
data). To enable posting ideas, persisted votes, and admin delete, wire up
Supabase. ~15 minutes, one-time.

## 1. Create the Supabase project

1. Create a new project at https://supabase.com/dashboard (region near your users).
2. Copy from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)

## 2. Run the migration

In the Supabase **SQL editor**, paste and run
[`supabase/migrations/0001_roadmap.sql`](../../supabase/migrations/0001_roadmap.sql).
It creates the `ideas` + `votes` tables, RLS (public read only — all writes go
through the service role), the `cast_vote` / `remove_vote` functions, and seeds
the 10 starter ideas.

Then run [`supabase/migrations/0002_comments.sql`](../../supabase/migrations/0002_comments.sql)
— it adds the `comments` table and an `ideas.comment_count` kept in sync by a
trigger. (The board degrades gracefully if 0002 hasn't run yet, but comments
won't work until it has.)

## 3. Set up admin sign-in (Google)

Admins sign in with Google on the **hidden** `/open-roadmap/admin` page (not
linked anywhere, `noindex`). Only verified emails on an allow-listed company
domain (default `getpancake.ai` and `pancake.ai`) get admin, which unlocks delete.

1. In **Google Cloud Console → APIs & Services → Credentials**, create an
   **OAuth client ID** of type **Web application**. Under *Authorised redirect
   URIs*, add one per origin:
   - `http://localhost:3001/api/roadmap/auth/google/callback` (local dev)
   - `https://getpancake.ai/api/roadmap/auth/google/callback` (production)
   - `https://pancake.ai/api/roadmap/auth/google/callback` (production once
     pancake.ai serves the site: the URI follows the host the admin signs in on)
2. Copy the **Client ID** → `GOOGLE_OAUTH_CLIENT_ID` and **Client secret** →
   `GOOGLE_OAUTH_CLIENT_SECRET`.
3. Set `ROADMAP_AUTH_SECRET` to a long random string (`openssl rand -hex 32`) —
   it's the HMAC key that signs the admin session cookie.
4. (Optional) Set `ROADMAP_ALLOWED_EMAIL_DOMAINS` (comma-separated) to change or
   extend the allowed domains. Defaults to `getpancake.ai,pancake.ai`.
5. Visit `/open-roadmap/admin`, click **Sign in with Google**. On success a
   signed, HttpOnly cookie (valid 7 days) is set and delete buttons appear on
   the board. **Sign out** (on the board or the admin page) clears it.

How it's enforced: the callback exchanges Google's code for the user's verified
email server-side, checks the domain, then sets a cookie signed with
`ROADMAP_AUTH_SECRET`, so it can't be forged and JS can't read it (HttpOnly).
The delete route verifies that cookie — and re-checks the email domain — on
every request.

**Fail-closed:** missing config, no/invalid/expired cookie, or an email outside
the allowed domains ⇒ no admin, delete denied. Posting and voting work
regardless.

## 4. Set environment variables

Copy `.env.local.example` → `.env.local` for local dev, and set the same vars in
**Vercel → Settings → Environment Variables**:

| Var | What |
|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key (secret) |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth client secret (secret) |
| `ROADMAP_AUTH_SECRET` | admin session signing key (secret) |
| `ROADMAP_ALLOWED_EMAIL_DOMAINS` | optional; allowed email domains (default `getpancake.ai,pancake.ai`) |

Redeploy. The board switches from preview mode to live automatically.

## How auth is wired (for future changes)

Everyone reads. Anyone posts (guarded by a honeypot field + per-IP rate
limiting in the API routes). Only a request carrying a valid admin cookie can
delete — enforced server-side in the delete route via `isAdmin()`.

The admin check lives in **one** place: `lib/auth/admin.ts` (`isAdmin` +
`isAllowedAdminEmail`/`mintAdminCookie`). The Google handshake is isolated in
`lib/auth/google.ts`, driven by the routes under `app/api/roadmap/auth/google`.
The routes + page call through `isAdmin()`, so swapping the auth model later
touches only those modules.

## Security notes

- The `service_role` key is only ever read server-side (`lib/supabase/admin.ts`
  is marked `server-only`). Never put it in a `NEXT_PUBLIC_*` var.
- Rate limiting is in-memory (per serverless instance) — a first-line guardrail,
  not a global limiter. Swap in Upstash/Vercel KV behind `lib/rate-limit.ts` if
  abuse becomes real.
