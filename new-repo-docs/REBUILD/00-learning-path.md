# Phase 0: Learning Path

> **Goal:** Before you write code, understand what concepts you need to learn — and in what order. This phase is a curriculum, not code.

---

## The Journey

```
HTML/CSS ──→ JavaScript ──→ React ──→ Supabase
   │            │             │            │
   ▼            ▼             ▼            ▼
  Structure    Logic        UIs          Database
```

---

## Prerequisites Per Phase

| Phase | Requires | You Should Know |
|---|---|---|
| **01–02** (Overview + Setup) | Basic terminal usage | What is npm, what is a `package.json`, basic `git` |
| **03** (Supabase Schema) | None for the schema itself | Just follow the SQL — no coding needed |
| **04** (Auth) | JavaScript basics | Functions, objects, `import`/`export`, `async/await` |
| **05** (Data Layer) | JavaScript intermediate | Array methods (`.map`, `.filter`, `.reduce`), Promises, `useState`, `useEffect`, `useCallback`, `useMemo` |
| **06** (Utilities) | JavaScript basics | Pure functions, array operations |
| **07** (Core UI) | React basics + Tailwind | JSX, components, props, Tailwind utility classes |
| **08** (Home Screen) | React basics | Conditional rendering, JSX |
| **09** (Kanban) | React intermediate | `useState`, `useCallback`, `useMemo`, lift state up, DnD Kit patterns |
| **10** (Project Detail) | React intermediate | `useCreateBlockNote`, lazy loading with `Suspense`, `React.lazy` |
| **11** (Charts) | JavaScript intermediate | D3 selectors, SVG, data joins |
| **12** (Calendar) | React intermediate | `useMemo`, date manipulation, grid layout |
| **13** (Ledger) | React advanced | Multiple state variables, complex filtering, async CRUD |
| **14** (RBAC) | React advanced | Context patterns (or prop drilling), lazy loading, auth flow |
| **15** (Dept Tabs) | React intermediate | Component reuse patterns, lazy loading |
| **16** (Deploy) | DevOps basics | Environment variables, GitHub Actions, secrets |

---

## Recommended Learning Sequence

### Step 1: HTML + CSS Foundations (1–2 weeks)

Learn:
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<div>`)
- CSS Flexbox (how elements align horizontally/vertically)
- CSS Grid (how elements arrange in rows/columns)
- CSS classes, IDs, specificity
- Responsive design with `@media` queries

**Practice:** Recreate the ACES Home page hero (`REBUILD/08-home-screen.md`) in plain HTML/CSS — the maroon background, gold text, centered layout.

### Step 2: JavaScript Fundamentals (2–3 weeks)

Learn:
- Variables (`let`, `const`), data types (string, number, boolean, object, array)
- Functions (arrow functions, parameters, return values)
- Array methods: `.map()`, `.filter()`, `.reduce()`, `.find()`
- Object and array destructuring
- `async` / `await` and Promises (how `fetch()` works)
- `import` / `export` (ES modules)

**Practice:** Take the `reference/project_reference.csv` data and write functions to:
1. Parse it into objects
2. Filter by status
3. Sum the budget
4. Map it to a different format

### Step 3: React Basics (2–3 weeks)

Learn:
- `createRoot` and `render` (what `main.jsx` does)
- JSX syntax (JavaScript in HTML-like tags)
- Components (functions that return JSX)
- Props (passing data to components)
- `useState` (component memory)
- `useEffect` (side effects — fetching data)
- Conditional rendering (`if`, ternary `? :`, `&&`)

**Practice:** Build the Layout + Header (`REBUILD/07-core-ui.md`) in a fresh Vite project. Don't worry about data yet — just get the tabs to switch on click.

### Step 4: React Intermediate (1–2 weeks)

Learn:
- `useCallback` (memoizing functions)
- `useMemo` (memoizing computed values)
- Lifting state up (parent manages state, children render)
- `React.lazy` + `Suspense` (code splitting)

**Practice:** Build a mini-Kanban with 3 hardcoded projects in each column. Drag doesn't need to work — just render the columns and cards.

### Step 5: Supabase (1–2 weeks)

Learn:
- What is PostgreSQL? (tables, rows, columns, primary keys, foreign keys)
- What is RLS? (row-level security — rows you can't see don't exist)
- `@supabase/supabase-js` basics:
  - `supabase.from('table').select('*')`
  - `.insert()`, `.update()`, `.delete()`
  - `.eq()`, `.order()`, `.single()`
- Supabase Auth (Google OAuth flow)

**Practice:** Create a free Supabase project, run the migration SQL from `SCHEMA.md`, then write a tiny HTML page that fetches `projects` and logs them to console.

### Step 6: Putting It Together (ongoing)

Now you can follow the `REBUILD/` phases in order. At this point:
- You understand what each line of code does
- You can debug errors by reading the browser console
- You can adapt patterns from existing components to new ones

---

## Common Beginner Pitfalls

| Pitfall | What Actually Happens | Fix |
|---|---|---|
| "I changed the code but nothing happened" | Vite HMR sometimes misses; browser caches old build | Hard refresh (`Ctrl+Shift+R`) or restart dev server |
| "RLS returned 0 rows" | RLS policy blocks your query | Check Supabase dashboard → Table Editor → toggle RLS off temporarily to verify data exists |
| "`undefined is not an object`" | You accessed `project.name` but `project` is `undefined` | Check that the data loaded: `if (!project.data) return <Loading />` |
| "`async` function returned `[object Promise]`" | You forgot `await` | Add `await` before the async call |
| "Tailwind styles aren't applying" | Class name typo or Tailwind didn't scan your file | Check `content` paths in `tailwind.config.js` |
| "Google OAuth redirects to a blank page" | Redirect URI not added to Google Cloud Console | Add the full URL to both Google Cloud and Supabase Auth settings |
| "npm install fails with ERESOLVE" | Dependency version conflict | Use `npm install --legacy-peer-deps` or match exact versions from `package.json` |

---

## Learning Resources

| Topic | Free Resource |
|---|---|
| HTML/CSS | [web.dev/learn](https://web.dev/learn) |
| JavaScript | [javascript.info](https://javascript.info) |
| React | [react.dev/learn](https://react.dev/learn) |
| Supabase | [supabase.com/docs](https://supabase.com/docs) |
| PostgreSQL | [postgresqltutorial.com](https://www.postgresqltutorial.com) |
| Tailwind | [tailwindcss.com/docs](https://tailwindcss.com/docs) |
| D3 | [d3js.org/getting-started](https://d3js.org/getting-started) |

---

## Suggested Daily Schedule

| Week | Focus | Hours/Day |
|---|---|---|
| 1–2 | HTML + CSS basics | 1–2 |
| 3–5 | JavaScript fundamentals | 1–2 |
| 6–8 | React basics (components, state, props) | 1–2 |
| 9 | React hooks (useEffect, useMemo, useCallback) | 1–2 |
| 10 | Supabase basics + auth | 1–2 |
| 11–16 | Follow REBUILD phases at your own pace | 1–3 |

---

## Next Step

Only proceed to [`01-overview.md`](01-overview.md) when you understand:
- What JSX is and why React uses it
- What `useState` and `useEffect` do
- How to fetch data with `fetch()` and handle the response
- What `async/await` means
- The difference between a JavaScript object and an array

If any of those are unclear, stay in Phase 0 and study the resources above.
