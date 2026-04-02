# 🚀 Railway Deployment — Step by Step

## What Railway gives you
- Persistent Node.js process (WebSockets work)
- Managed PostgreSQL (data survives restarts forever)
- Free tier: $5 credit/month (enough for light use)
- Auto-deploys when you push to GitHub

---

## Step 1 — Push to GitHub

```bash
cd ceo-tracker

git init
git add .
git commit -m "Initial commit — CEO Executive Tracker"
```

Go to https://github.com/new → create a repo → then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ceo-tracker.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Create Railway Project

1. Go to https://railway.app → **Sign in with GitHub**
2. Click **New Project**
3. Choose **Deploy from GitHub repo**
4. Select your `ceo-tracker` repo
5. Click **Deploy Now**

Railway will start building. It will fail at first — that's expected. Continue to Step 3.

---

## Step 3 — Add PostgreSQL Database

1. In your Railway project dashboard, click **+ New**
2. Select **Database → Add PostgreSQL**
3. Wait ~30 seconds for it to provision

Railway automatically sets `DATABASE_URL` in your app's environment. You don't need to copy anything.

---

## Step 4 — Set Environment Variables

In Railway dashboard → click your **app service** (not the database) → **Variables** tab → click **RAW Editor** and paste:

```
NODE_ENV=production
JWT_SECRET=PASTE_A_LONG_RANDOM_STRING_HERE
CEO_PASSWORD=YourCEOPasswordHere
ASSISTANT_PASSWORD=YourAssistantPasswordHere
```

**Generate a strong JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> ⚠️ IMPORTANT: Change the passwords from the defaults before going live.

---

## Step 5 — Set Build & Start Commands

In Railway → your app service → **Settings** tab:

| Field | Value |
|-------|-------|
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

---

## Step 6 — Deploy

Click **Deploy** (or push a new commit to GitHub — it auto-deploys).

Watch the build logs. You should see:
```
[Boot] Running database migrations…
[DB] Schema ready ✓
[DB] Seeded 31 tasks ✓
[Boot] Initializing task store…
[Store] Loaded 31 tasks into cache ✓
✅ CEO Executive Tracker running
```

---

## Step 7 — Get Your Live URL

In Railway → your app service → **Settings** → **Domains** → click **Generate Domain**.

You'll get something like:
```
https://ceo-tracker-production.up.railway.app
```

Share this URL with Mr. Mohammad and Darlene. That's it — you're live! 🎉

---

## Troubleshooting

### "Application failed to respond" on Railway
→ Make sure `PORT` is NOT set manually. Railway injects it automatically.
→ Make sure `host = '0.0.0.0'` in server.ts (already set).

### Database connection errors
→ Verify PostgreSQL service is running in Railway dashboard.
→ `DATABASE_URL` is set automatically — don't override it manually.

### WebSockets not connecting
→ Railway supports WebSockets natively on all plans. No extra config needed.
→ Make sure the WS path is `/ws` (already configured).

### Tasks reset after deploy
→ This should NOT happen with PostgreSQL. If it does, check that:
   - Your PostgreSQL service is running
   - `DATABASE_URL` is set in your app's environment
   - The health check at `/api/health` returns `{"db":"connected"}`

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Auto-set by Railway | PostgreSQL connection string |
| `NODE_ENV` | ✅ Set to `production` | Enables SSL, optimizations |
| `JWT_SECRET` | ✅ Set a strong secret | Signs login tokens — change this! |
| `CEO_PASSWORD` | ✅ Change from default | Mr. Mohammad's login password |
| `ASSISTANT_PASSWORD` | ✅ Change from default | Darlene's login password |
| `PORT` | ⛔ Don't set | Railway injects this automatically |

---

## Updating the App

```bash
# Make changes locally, then:
git add .
git commit -m "Update: describe your change"
git push
```

Railway automatically redeploys. Takes ~2 minutes. Zero downtime.
