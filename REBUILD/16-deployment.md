# Phase 16: Deployment

> **Goal:** Deploy the React SPA to GitHub Pages, configure environment variables, and prepare for Vercel deployment.

---

## 16.1 — Prerequisites

- GitHub repository with the code pushed to `main`
- Supabase project running (from Phase 3)
- Google OAuth configured (from Phase 4)

## 16.2 — Environment Variables

Create a `.env.production` file (or set in GitHub Actions secrets):

```env
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

**Important:** The `VITE_SUPABASE_ANON_KEY` is safe to expose in client-side code. Supabase RLS ensures data security. Never expose the `service_role` key.

## 16.3 — Configure `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/aces-dashboard/',  // Change to your repo name
});
```

The `base` path must match your GitHub Pages URL subpath. For `https://username.github.io/aces-dashboard/`, use `base: '/aces-dashboard/'`.

## 16.4 — Deploy to GitHub Pages

### Option A: Manual

```bash
npm run build        # Builds to dist/
npm run deploy       # gh-pages -d dist
```

### Option B: CI/CD (Recommended)

Create `.github/workflows/deploy.yml`:

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
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Then set the secrets in GitHub: **Settings → Secrets and variables → Actions → New repository secret**

## 16.5 — Enable GitHub Pages

1. Go to **Settings → Pages**
2. Under "Build and deployment" → "Branch"
3. Select `gh-pages` branch, root folder
4. Click Save

## 16.6 — Google OAuth for Production

Update the Authorized Redirect URIs in Google Cloud Console:

- Add `https://username.github.io/aces-dashboard/` (production URL)
- Add `http://localhost:5173` (still needed for local dev)

Also update Supabase Auth settings:
- Add the production URL to **Site URL** in Authentication → Settings
- Add `https://username.github.io` to **Additional Redirect URLs**

## 16.7 — Vercel Preparation (Future)

The current prototype is a static SPA. When you want backend features:

1. Push to Vercel for automatic deployment:
   ```bash
   npx vercel --prod
   ```
2. Configure environment variables in Vercel dashboard
3. Add Vercel URL to Google Cloud OAuth redirect URIs

Vercel advantages over GitHub Pages:
- Server-side environment variables (no `.env` exposed)
- Edge functions (if needed later)
- Automatic HTTPS + CDN
- Preview deployments for each PR

## 16.8 — Google OAuth Redirect URL Summary

For the app to work everywhere, add ALL of these to Google Cloud Console:

| Environment | Redirect URI |
|---|---|
| Local dev | `http://localhost:5173` |
| Supabase callback | `https://yourproject.supabase.co/auth/v1/callback` |
| GitHub Pages | `https://username.github.io/aces-dashboard/` |
| Vercel (future) | `https://your-app.vercel.app` |

## 16.9 — Verification Checklist

- [ ] `npm run dev` works locally with Supabase data
- [ ] Google OAuth login works on localhost
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run deploy` pushes to `gh-pages`
- [ ] GitHub Pages site loads without 404 errors
- [ ] Google OAuth login works on production URL
- [ ] RLS policies allow correct data access per role
- [ ] All 5 core tabs display data correctly
- [ ] Mobile layout is functional
- [ ] Dark mode toggle works

---

## Next Step

Return to [`../REBUILD_GUIDE.md`](../REBUILD_GUIDE.md) for the full phase index.
