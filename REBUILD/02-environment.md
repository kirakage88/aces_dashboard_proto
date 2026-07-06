# Phase 2: Environment Setup

> **Goal:** Scaffold the Vite project, install all dependencies, configure Tailwind + PostCSS.

---

## 2.1 — Scaffold with Vite

```bash
npm create vite@latest aces-dashboard -- --template react
cd aces-dashboard
```

This creates the basic project structure with `index.html`, `src/`, `vite.config.js`, etc.

## 2.2 — Install Dependencies

```bash
# Core
npm install react@^18 react-dom@^18

# Supabase
npm install @supabase/supabase-js@^2

# Charts
npm install d3@^7

# Icons
npm install lucide-react@^0.468

# Drag and Drop
npm install @dnd-kit/core@^6 @dnd-kit/sortable@^10 @dnd-kit/utilities@^3

# WYSIWYG Editor
npm install @blocknote/core@^0.51 @blocknote/react@^0.51

# Dev Dependencies
npm install -D vite@^6 @vitejs/plugin-react@^4
npm install -D tailwindcss@^3 postcss@^8 autoprefixer@^10
npm install -D gh-pages@^6
```

**Note:** `papaparse` is NOT installed — it was used for CSV parsing in the old version. Supabase SDK replaces it entirely.

## 2.3 — Configure `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/aces_dashboard/',
});
```

The `base` path must match your GitHub Pages repository sub-path. Change `/aces_dashboard/` to match your repo name.

## 2.4 — Tailwind CSS + PostCSS

**`postcss.config.js`:**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**`tailwind.config.js`:**

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#101010',
          card: '#090d10',
          text: '#d6def0',
          muted: '#8895b5',
          border: '#1c2330',
          'border-md': '#283040',
          input: '#111a24',
          hover: '#1a2230',
          accent: '#fbcc0e',
        },
      },
    },
  },
  plugins: [],
};
```

## 2.5 — `src/index.css`

Replace the default CSS with Tailwind directives + custom styles:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #55000033;
  border-radius: 3px;
}
```

## 2.6 — `.env` File (Template)

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These will be configured in Phase 3 after creating the Supabase project.

## 2.7 — Verify

```bash
npm run dev
```

You should see the default Vite starter page at `http://localhost:5173`. If it loads, the environment is ready.

## 2.8 — File Structure at This Point

```
aces-dashboard/
├── .env                        # (created, not committed to git)
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    └── assets/                 # (can delete the default Vite assets)
```

---

## Next Step

Proceed to [`03-supabase-schema.md`](03-supabase-schema.md) to set up the Supabase project and run the migration.
