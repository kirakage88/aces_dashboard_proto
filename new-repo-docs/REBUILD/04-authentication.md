# Phase 4: Authentication

> **Goal:** Configure Google OAuth, create the Supabase client, build the `useAuth` hook, and implement the auth flow.

---

## 4.1 — Google OAuth Setup (Google Cloud Console)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. If prompted, configure the **OAuth consent screen**:
   - User type: **External**
   - App name: `ACES Dashboard`
   - Support email: your email
   - Scopes: `email`, `profile`
   - Test users: add your email
6. For **Application type**: choose **Web application**
7. Add **Authorized redirect URIs**:
   - `https://yourproject.supabase.co/auth/v1/callback` (get this from Supabase Auth settings)
   - `http://localhost:5173` (for local development)
8. Copy the **Client ID** and **Client Secret**

## 4.2 — Configure Supabase Auth

1. In Supabase Dashboard, go to **Authentication → Settings**
2. Under **External OAuth Providers**, enable **Google**
3. Paste the **Client ID** and **Client Secret** from Google Cloud Console
4. Copy the **Callback URL** shown in Supabase and add it to Google Cloud Console's Authorized Redirect URIs if you haven't already
5. Save

## 4.3 — Create `src/lib/supabase.js`

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 4.4 — Create `src/hooks/useAuth.js`

```js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // public.users row
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('users')
      .select('*, departments(*)')
      .eq('id', userId)
      .single();
    
    setProfile(data);
    setLoading(false);
  };

  const signIn = useCallback(() => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  }, []);

  const signOut = useCallback(() => {
    return supabase.auth.signOut();
  }, []);

  return { user, profile, loading, signIn, signOut };
}
```

**Key behavior:**
- On first login, `profile` will be `null` because the `users` table has no row for this user yet
- The app should redirect to a **profile setup** screen where the user selects their department
- After setup, `fetchProfile` is called again to load the department info

## 4.5 — Create `src/components/LoginScreen.jsx`

```jsx
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginScreen({ onLogin }) {
  useEffect(() => {
    // Handle OAuth redirect — check for session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) onLogin(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) onLogin(session.user);
      }
    );
    return () => subscription?.unsubscribe();
  }, [onLogin]);

  return (
    <div className="min-h-screen bg-[#1a0000] flex items-center justify-center">
      <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10 
                      max-w-md w-full mx-4 text-center">
        <h1 className="text-5xl font-black text-[#efbf04] mb-2">ACES</h1>
        <p className="text-white/50 text-sm font-black uppercase tracking-widest mb-8">
          Audit Management System
        </p>
        <button
          onClick={() => supabase.auth.signInWithOAuth({ 
            provider: 'google',
            options: { redirectTo: window.location.origin }
          })}
          className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-6 
                     rounded-xl transition-all flex items-center justify-center gap-3
                     shadow-xl active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
```

## 4.6 — Auth Flow Diagram

```
App Load
  │
  ├─ No session → Show LoginScreen → User clicks "Sign in with Google"
  │                                  → Google OAuth popup
  │                                  → Supabase creates auth.users row
  │                                  → Handle redirect back to app
  │                                  → Fetch profile from public.users
  │                                  │
  │                                  ├─ Profile exists → Set role → Show app
  │                                  └─ No profile → Show SetupScreen
  │                                                (select department + role)
  │                                                → INSERT into public.users
  │                                                → Show app
  │
  └─ Has session → Fetch profile → Show app immediately
```

## 4.7 — Profile Setup Screen

After first Google login, the user needs to select their department and role:

```jsx
// src/components/ProfileSetupScreen.jsx
// Fetches list of departments from Supabase
// User picks their department and role
// Inserts row into public.users table
// Then navigates to the main app
```

No code needed yet — build this when you implement the login flow in Phase 14.

## 4.8 — Protect `App.jsx`

```jsx
// In App.jsx
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, profile, loading, signIn, signOut } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginScreen onLogin={() => window.location.reload()} />;
  if (!profile) return <ProfileSetupScreen userId={user.id} onComplete={() => {}} />;

  // ... main app with role-based tabs
}
```

---

## Next Step

Proceed to [`05-data-layer.md`](05-data-layer.md) to build the Supabase data fetching hooks.
