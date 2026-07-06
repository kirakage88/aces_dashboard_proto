# Implementation Roadmap — ACES Dashboard

> **Current phase:** Prototype (Supabase migration in progress)

---

## Phase 1 — Supabase + Auth (Current)

- [ ] Create Supabase project
- [ ] Run migration SQL (all 5 tables + RLS + seed data)
- [ ] Configure Google OAuth (Google Cloud Console + Supabase Auth)
- [ ] Create `src/lib/supabase.js` (client init)
- [ ] Create `src/hooks/useAuth.js` (auth state, session, sign in/out)
- [ ] Create `LoginScreen.jsx` (Google OAuth button)

## Phase 2 — Data Layer

- [ ] Create `src/hooks/useSupabaseData.js` (fetch + CRUD)
- [ ] Update `src/utils/ledger.js` (remove CSV parsing, keep currency helpers)
- [ ] Update `src/utils/project.js` (remove row-based indexing)
- [ ] Rewrite `src/utils/templates.js` (Supabase instead of localStorage)
- [ ] Delete `src/data/csvParser.js`, `src/data/sources.js`
- [ ] Uninstall `papaparse`

## Phase 3 — Core UI + RBAC

- [ ] Create `src/roles.js` (tab registry + role config)
- [ ] Build `Header.jsx` with dynamic tab rendering per role
- [ ] Wire `App.jsx` with auth gate and role-based tab switching
- [ ] Build Home screen, loading/error states
- [ ] Build `RoleSetupScreen.jsx` (first-login department picker)

## Phase 4 — Feature Tab Verification

- [ ] **Projects** — Kanban board with Supabase CRUD
- [ ] **Overview** — D3 charts with typed data
- [ ] **Calendar** — Month grid with Supabase data
- [ ] **Ledger** — Full dashboard with typed transactions
- [ ] **Project Detail** — BlockNote editor saving to Supabase
- [ ] **Templates** — CRUD against Supabase `templates` table

## Phase 5 — Department-Specific Tabs (Future)

- [ ] Finance Budget tab (when reference sheet arrives)
- [ ] Finance Disbursements tab (when reference sheet arrives)
- [ ] Events Dashboard tab (when reference sheet arrives)
- [ ] Additional department tabs as reference sheets are provided

## Phase 6 — Deployment & Polish

- [ ] Environment variable config for production
- [ ] GitHub Actions CI/CD with Supabase secrets
- [ ] Google OAuth redirect URLs for production
- [ ] GitHub Pages deploy verification
- [ ] Vercel preparation (for future full-stack deployment)

---

## Architecture Notes

1. **Data model** — 5 Supabase tables: `departments`, `users`, `projects`, `transactions`, `templates`. Named columns instead of CSV row indexing.
2. **Security** — Row-Level Security (RLS) enforced at database level. Executive roles see all data; department roles see only their own.
3. **Auth** — Google OAuth via Supabase Auth. No passwords to manage.
4. **No backend** — Supabase SDK talks directly from browser to PostgreSQL. No app server needed.
5. **Currency** — `NUMERIC(12,2)` in PostgreSQL eliminates float precision bugs.
6. **BlockNote** — `JSONB` column stores editor state. Still lazy-loaded (~852 KB).
7. **Templates** — Stored in Supabase `templates` table (not localStorage).
8. **Rebuild guide** — See `REBUILD_GUIDE.md` for full step-by-step instructions.
