# Signal Board

A personal and team task tracker that runs as a single page, can be installed
on a phone as an app, and keeps working offline.

## Where your data lives

- **Signed in (cloud sync on):** the board is stored in your Supabase
  database and is the same on every device you sign in on. The browser keeps a
  working copy only so the board opens instantly and edits made offline can be
  uploaded later. The footer always shows the sync state.
- **Not signed in, or cloud not set up:** the board is saved only in this
  browser on this device. Clearing site data deletes it. Use **⬇ Backup**.

Every cloud save carries a version number. If two devices edit from the same
starting point, the second save is rejected instead of overwriting the first,
and you're asked which board to keep. The other one is downloaded as a backup
file first.

The service worker only caches app files and fonts. It never caches board data
or Supabase requests.

## Setting up cloud sync (one time)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the project, open **SQL Editor**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql) and run it. This creates the
   `boards` table and the rules that let each account read and write only its
   own board.
3. Open **Authentication → URL Configuration** and set **Site URL** to the
   address you open Signal Board at (for example your GitHub Pages URL). The
   confirmation email links back there.
4. Open **Project Settings → API**, copy the **Project URL** and the
   **anon / publishable** key into [`config.js`](config.js), then commit and
   deploy.
5. Open the app, enter your email and a password, press **Create account**,
   confirm the email, then **Sign in**. If this device already has a board, it
   is uploaded as your first cloud board.
6. Recommended: once your account exists, turn off new sign-ups under
   **Authentication → Sign In / Providers** ("Allow new users to sign up"), so
   nobody else can create accounts on your project.

The anon key is meant to be public, so it's fine in this public repo. What
protects your board is the Row Level Security in `schema.sql`; don't disable it.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app: markup, styles and script |
| `config.js` | Supabase project URL and anon key (empty = device-only mode) |
| `supabase/schema.sql` | Database table and access rules |
| `vendor/supabase-js-2.117.2.js` | Supabase client library (MIT, see `vendor/supabase-js-LICENSE`) |
| `sw.js` | Service worker for offline use |
| `manifest.json`, `icon-*.png` | Install-as-app metadata and icons |

When you change app files, bump `CACHE_NAME` in `sw.js`.
