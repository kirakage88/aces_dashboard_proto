# Deployment Strategy: `main` vs `gh-pages`

## Overview

ACES Dashboard uses a **two-branch** deployment model:

| Branch | Purpose | Contents | Served by GitHub Pages? |
|---|---|---|---|
| `main` | Source code | React components, config, assets, docs | No |
| `gh-pages` | Production build | Compiled `index.html` + bundled JS/CSS | **Yes** |

This separation keeps the source code private (in the sense that it's not forced onto every visitor's browser) and ensures the deployed site is as fast as possible — just static files, no raw React source.

---

## What each branch contains

### `main` (your working branch)

```
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── public/
│   └── *.csv              # fallback data for local dev
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/
│   ├── hooks/
│   ├── tabs/
│   ├── utils/
│   ├── data/
│   └── constants.js
└── docs/
    └── deployment-strategy.md
```

You edit, commit, and push to `main` as normal. It is never served directly to users.

### `gh-pages` (auto-generated deployment branch)

```
├── index.html              # Vite's compiled entry point
├── assets/
│   ├── index-xxxxxxxx.css  # Tailwind + all CSS, hashed
│   └── index-xxxxxxxx.js   # All JS bundled, hashed
└── (no other files)
```

This branch is **force-pushed** by the `gh-pages` npm package. Never edit it manually. Every deploy overwrites its entire history.

---

## Two deployment approaches

There are two ways to deploy. The **standard (CI/CD) approach** is recommended for any project you plan to maintain long-term. The **manual approach** is simpler to set up but requires you to run a command every time you want to publish changes.

---

### Approach A: Standard — GitHub Actions CI/CD (recommended)

This is the **industry standard** for deploying SPAs to GitHub Pages. Every time you push to `main`, a GitHub Actions workflow automatically builds and deploys the site. No manual commands needed.

#### Setup

1. **Create `.github/workflows/deploy.yml`** in your repository:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. **Push the workflow file** to `main`:

```bash
git add .github/workflows/deploy.yml
git commit -m "add CI/CD deployment workflow"
git push origin main
```

3. **Enable GitHub Pages** in your repo settings:
   - Go to Settings → Pages
   - Under "Build and deployment" → "Branch"
   - Select `gh-pages` branch, root folder
   - Click Save

#### How it works

| Event | Action |
|---|---|
| You push a commit to `main` | Triggers the workflow |
| `actions/checkout` | Clones your repo into the runner |
| `npm ci` | Installs exact dependencies from `package-lock.json` |
| `npm run build` | Compiles `src/` → `dist/` |
| `peaceiris/actions-gh-pages` | Deploys `dist/` to the `gh-pages` branch |

#### Pros and cons

| ✅ Pros | ❌ Cons |
|---|---|
| Fully automatic — no manual steps | Requires initial setup of workflow file |
| Every push is a deploy — impossible to forget | Build failures block deployment (which is a feature — you catch errors before they go live) |
| Audit trail — every deploy is linked to a specific commit on `main` | Slight delay (~30–60s) between push and live update |
| No local build tools needed to deploy (just `git push`) | |
| Works on mobile / any browser — no laptop required | |

---

### Approach B: Manual — npm run deploy (current setup)

The project currently uses this approach. You run the deploy command locally whenever you want to publish.

#### How it works

```bash
npm run build    # 1. Compile src/ → dist/
npm run deploy   # 2. Push dist/ → gh-pages
```

Step-by-step:

1. **`npm run build`** (`vite build`)
   - Reads `src/`, processes React + JSX + Tailwind
   - Outputs compiled, minified, hashed files into `dist/`
   - Generates a single `index.html` that loads the hashed assets

2. **`npm run deploy`** (`gh-pages -d dist`)
   - The `gh-pages` npm package creates a **temporary orphan commit** containing only the contents of `dist/`
   - It **force-pushes** that commit to the `gh-pages` branch
   - Your `main` branch is completely untouched

#### Before and after

```
Before deploy:

  main      A---B---C          (your source commits)
  gh-pages  X---Y              (previous deploy)

After deploy:

  main      A---B---C          (unchanged)
  gh-pages  X---Y---Z          (Z = new orphan commit with dist/ only)
```

#### Pros and cons

| ✅ Pros | ❌ Cons |
|---|---|
| Simple — no YAML files, no CI setup | Manual — easy to forget to deploy after a change |
| Everything runs locally — no dependency on external runners | Requires Node.js + npm installed on your machine |
| Full control over when deploys happen | Can't deploy from a phone or tablet |

---

## Choosing between the two

| Scenario | Recommended approach |
|---|---|
| Prototype / solo project | Manual (Approach B) — minimal setup, you're the only one pushing |
| Team project | CI/CD (Approach A) — everyone's pushes get deployed automatically, no coordination needed |
| Production / client-facing | CI/CD (Approach A) — audit trail, reliability, no forgotten deploys |
| Learning / experimenting | Manual (Approach B) — understand what's happening under the hood |

You can also **start with manual and migrate to CI/CD later** — the `gh-pages` branch is the same either way. The workflow file is the only addition.

---

## Migrating from manual to CI/CD

1. Create `.github/workflows/deploy.yml` with the workflow from Approach A above
2. Push it to `main`
3. The first run will deploy whatever is currently in `main`
4. From that point on, every push to `main` triggers an automatic deploy
5. You never need to run `npm run deploy` again (but it still works if you do)

---

## Vite base path (required for both approaches)

Because the site is served from a **subfolder** (`https://kirakage88.github.io/aces_dashboard_proto/`), Vite's `base` must match:

```js
// vite.config.js
export default defineConfig({
  base: '/aces_dashboard_proto/',
  // ...
});
```

This ensures all asset URLs in the built `index.html` point to the correct path. Without this, the browser would look for assets at the root (`/`) instead of the subfolder. This applies to both manual and CI/CD deploys.

---

## Key takeaways

- **`main`** = source code. **`gh-pages`** = compiled output.
- Both approaches push to the `gh-pages` branch — the destination is the same.
- Never manually commit to `gh-pages` — it will be overwritten on the next deploy.
- The `base` config in `vite.config.js` must match your GitHub Pages URL path.
- **CI/CD is the standard** for any project maintained by more than one person or used in production.
