# Google OAuth (Sign in with Google) — Setup Guide

The code is already done — `lib/auth.ts` auto-enables the Google login button the moment the two
environment variables below exist. You only need to create the credentials in Google Cloud.
Total time: ~15 minutes. Cost: free.

## Step 1 — Create a Google Cloud project

1. Go to https://console.cloud.google.com/ and sign in with the Google account you want to own
   this (use your business account, e.g. the one tied to info@medaghar.com if it has one).
2. Top bar → project dropdown → **New Project**.
3. Name: `MedaGhar` → **Create**, then make sure it is selected.

## Step 2 — Configure the OAuth consent screen

1. Left menu → **APIs & Services → OAuth consent screen** (now called "Google Auth Platform").
2. Click **Get started**:
   - App name: `MedaGhar`
   - User support email: `info@medaghar.com` (or your Gmail)
   - Audience: **External**
   - Contact email: `info@medaghar.com`
3. Under **Branding**, add:
   - App domain / homepage: `https://medaghar.com`
   - Privacy policy: `https://medaghar.com/privacy`
   - Terms of service: `https://medaghar.com/terms`
   - Authorized domain: `medaghar.com`
4. You do NOT need to add scopes manually — NextAuth only uses the default
   `openid email profile` scopes, which require no Google verification review.
5. Publish the app (Audience → **Publish app** → confirm). With only basic scopes there is no
   verification wait; the "unverified app" warning does not appear for basic profile scopes.

## Step 3 — Create the OAuth Client ID

1. **APIs & Services → Credentials → + Create Credentials → OAuth client ID**.
2. Application type: **Web application**. Name: `MedaGhar Web`.
3. **Authorized JavaScript origins** — add both:
   ```
   https://medaghar.com
   https://www.medaghar.com
   ```
   (For local testing also add `http://localhost:3000`.)
4. **Authorized redirect URIs** — add exactly:
   ```
   https://medaghar.com/api/auth/callback/google
   https://www.medaghar.com/api/auth/callback/google
   ```
   (For local testing: `http://localhost:3000/api/auth/callback/google`.)
5. **Create** → copy the **Client ID** (ends in `.apps.googleusercontent.com`) and
   **Client secret** (starts with `GOCSPX-`).

## Step 4 — Add the credentials to the server

Edit `/var/www/medaghar.com/.env` and add:

```env
GOOGLE_CLIENT_ID="xxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
```

Also confirm `NEXTAUTH_URL="https://medaghar.com"` is set in the same file (it must match the
domain users sign in from).

## Step 5 — Restart the app

```bash
cd /var/www/medaghar.com
pm2 restart medaghar --update-env
```

Open https://medaghar.com/signin — the **Continue with Google** button now appears.
Google-OAuth users skip email verification automatically (the code already handles this).

## Troubleshooting

| Error | Fix |
|---|---|
| `redirect_uri_mismatch` | The redirect URI in Google Console must be character-exact: `https://medaghar.com/api/auth/callback/google` (no trailing slash). |
| `Access blocked: app not verified` | Consent screen not published, or you added sensitive scopes — remove them; only basic profile scopes are needed. |
| Button doesn't appear | Env vars not loaded — check spelling, then `pm2 restart medaghar --update-env`. |
| Works on medaghar.com but not www | Add the `www` origin + redirect URI variants in the Google Console (Step 3). |

## Facebook login (optional, same pattern)

The code also supports Facebook via `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`.
Create an app at https://developers.facebook.com → Facebook Login → Web → redirect URI
`https://medaghar.com/api/auth/callback/facebook`. Note: Facebook requires a privacy policy URL
and app review for production mode; Google is the higher-value, lower-friction option in
Pakistan — do Google first.
