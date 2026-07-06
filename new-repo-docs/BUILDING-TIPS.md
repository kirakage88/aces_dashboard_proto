# Building Tips — Lessons From the Prototype

> Written after building the ACES Dashboard prototype. These are the things I wish I knew before starting.

---

## 1. Build in Layers, Not Features

Don't build "the Kanban" or "the ledger" in one shot. Build the stack vertically:

```
Data layer → Test it works → UI shell → Connect data → Polish
```

Every feature follows the same pattern. If the data hook is solid, the UI is just rendering. You never debug UI *and* data at the same time.

## 2. The Right Phase Order (Adapted for Momentum)

The `REBUILD/` phases are ordered by dependency. But if you want to see progress faster:

1. **Vite + Layout/Header** — get *something* in the browser day one. Fake the tab list with `useState`. Makes it feel real immediately.
2. **Supabase + Auth** — the hardest part. Do this next so you're not building on quicksand.
3. **Data hooks + utilities** — everything connects now.
4. **Feature tabs** — Kanban, Ledger, Calendar — now you're just assembling pieces.

## 3. Keep a `sandbox/` Directory

When you're not sure how a library works (D3, BlockNote, @dnd-kit), make a tiny test file:

```jsx
// sandbox/test-d3.jsx — just the donut, nothing else
export default function TestD3() {
  // 20 lines, no dependencies on your app
}
```

Import it from `App.jsx` temporarily. Isolate the thing you're learning. Don't debug a D3 chart inside a 200-line component.

## 4. Commit at Every Green Check

After every phase that `npm run build`s successfully, commit.

```
feat: Phase 7 — Layout + Header with dynamic tabs
feat: Phase 5 — useSupabaseData hook with CRUD
```

This is your safety net. When you break something (you will), `git diff` shows exactly what changed. You can always `git reset` back to the last working state.

## 5. Divide Labor Between You and AI

| AI is good at | You should focus on |
|---|---|
| Boilerplate CRUD hooks | Layout, spacing, color, typography |
| Data transformation | User workflows (what happens when I click this?) |
| Repeating component patterns | The feel of the app — transitions, loading states |
| Copy-paste edits across files | Data model decisions (what columns go where) |

When asking AI for code, be specific: *"Write a hook that fetches projects from Supabase and returns an array"* → it writes exactly that. *"Make the Kanban work"* → it writes a lot of things you may not need.

## 6. The Hardest Parts (In Order)

1. **Google OAuth + Supabase Auth** — the redirect flows are fiddly. Test this early. Get one user logged in before building anything else.
2. **RLS Policies** — they're silent. If a query returns 0 rows, RLS might be blocking it. Always have "toggle RLS off" as a debug step.
3. **D3 Charts** — D3 is powerful but unforgiving. Keep charts simple. A donut with hover interaction is enough.
4. **BlockNote** — the lazy chunk is 852 KB and has its own style system. Accept the weight or find a lighter editor. Pass `defaultStyles: false` to avoid Tailwind conflicts.

## 7. How to Work With This AI Effectively

- **Give me the file path** — I'll create or edit it directly
- **Tell me the pattern** — *"Like the existing TransactionTable but filtered to Expenditure type"*
- **Show me the data shape** — *"The projects table has columns: id, name, department_id..."* so I write matching code
- **Ask for one file at a time** — I write better code when focused on one thing
- **Keep AGENTS.md updated** — when you make a design decision, add it. Future you (and future me) will reference it

## 8. Don't Over-Engineer the RBAC

For 14 departments with only 6 custom views, you don't need a permission matrix or a role management UI. The `roles.js` approach — an object mapping role keys to tab arrays — is enough. Hardcode the 6 roles and move on to building the dashboards.

## 9. Keep AGENTS.md Updated

When you make a design decision, write it down in AGENTS.md. This file is the single source of truth for "how we do things here." Future AI sessions will use it to write code that matches your patterns.

## 10. The First 20% Is 80% of the Work

Getting Vite + Supabase + Auth + RLS all working together is the hardest part of the entire project. After that, adding tabs is fast because the infrastructure is done.

Don't get discouraged if the first week is just *"I saw a login screen and a blank page"* — that's real progress. The infrastructure is the foundation everything else sits on.

---

## Quick Reference

| Problem | Try This |
|---|---|
| Query returns 0 rows | Toggle RLS off in Supabase dashboard → if data appears, your policy is too strict |
| Can't log in | Check Google Cloud Console redirect URIs + Supabase Auth callback URL |
| Tailwind styles not applying | Check `content` paths in `tailwind.config.js` |
| npm install fails | `npm install --legacy-peer-deps` or match exact versions from package.json |
| "undefined is not an object" | Data hasn't loaded. Add `if (!data) return <Loading />` before accessing properties |
| D3 chart not updating | D3 doesn't re-render on prop changes unless you tell it to. Check your `useEffect` dependencies |
