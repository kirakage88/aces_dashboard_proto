# Phase 3: Supabase Schema

> **Goal:** Create the Supabase project, run the migration SQL to create all tables, RLS policies, and seed data.

---

## 3.1 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Name:** `aces-dashboard`
   - **Database Password:** (save this securely)
   - **Region:** Choose the closest to you
4. Wait ~2 minutes for the database to provision

## 3.2 — Get API Credentials

In the Supabase Dashboard:

1. Go to **Project Settings → API**
2. Copy:
   - **Project URL** → paste into `.env` as `VITE_SUPABASE_URL`
   - **anon public key** → paste into `.env` as `VITE_SUPABASE_ANON_KEY`

Your `.env` should now look like:
```env
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

## 3.3 — Run Migration SQL

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste the entire migration SQL from `SCHEMA.md` (or run it per section)

**Migration order (critical):**

```
1. Create tables (departments → users → projects → transactions → templates)
2. Create RLS helper functions (current_user_role, current_user_dept_id)
3. Enable RLS on all tables
4. Create RLS policies
5. Seed departments
6. Seed sample projects, transactions, default template
```

**Recommended:** Run each section as a separate SQL query to catch errors early.

## 3.4 — Create Seed User for Testing

After migration, create a test user to verify RLS:

```sql
-- Run in Supabase SQL Editor
-- First, create an auth user (this simulates a Google OAuth user)
INSERT INTO auth.users (id, email) 
VALUES ('00000000-0000-0000-0000-000000000001', 'test@aces.edu');

-- Then create the public.users row
INSERT INTO public.users (id, email, display_name, department_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@aces.edu',
  'Test Executive',
  (SELECT id FROM departments WHERE code = 'OP'),
  'executive'
);
```

## 3.5 — Verify the Setup

In Supabase SQL Editor, run:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check departments seeded
SELECT * FROM departments;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

## 3.6 — Manual RLS Test

1. Go to **Supabase Dashboard → Authentication → Users**
2. The test user should appear
3. Go to **Table Editor → projects**
4. Verify that only rows matching the test user's department are visible
5. Temporarily disable RLS to verify all rows exist, then re-enable

## 3.7 — Common Issues

| Issue | Fix |
|---|---|
| `relation "public.users" does not exist` | Run table creation queries in order |
| `auth.uid()` returns null | Make sure you're testing as an authenticated user |
| RLS blocks all reads | Check that policy names don't conflict — you may need to drop existing policies first |
| `ERROR: 42501: new row violates row-level security for table "users"` | The `users` table INSERT policy only allows inserting your own `id == auth.uid()` — for seed users, disable RLS temporarily |

## 3.8 — Schema Reference

Full schema documentation in `SCHEMA.md` includes:

- All 5 table definitions with column types and constraints
- Complete RLS policies for each table
- Helper function definitions
- Seed data for all tables
- Index recommendations
- CSV-to-PostgreSQL type mapping

---

## Next Step

Proceed to [`04-authentication.md`](04-authentication.md) to configure Google OAuth and build the auth hook.
