# Deployment Guide

Deploy three services: **API** (Railway), **Web** (Vercel), **Admin** (Vercel).
Database: **Neon** (managed Postgres, free tier works).

---

## 1. Database — Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string — it looks like `postgresql://user:pass@host/dbname?sslmode=require`
3. Run migrations from your local machine:
   ```sh
   DATABASE_URL="<neon-url>" pnpm --filter db migrate
   ```
4. Seed content:
   ```sh
   DATABASE_URL="<neon-url>" pnpm --filter db seed
   ```

---

## 2. API — Railway

### Required env vars

| Variable       | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| `DATABASE_URL` | Neon connection string                                         |
| `AUTH_SECRET`  | Random 32+ char string (`openssl rand -hex 32`)                |
| `API_URL`      | Public URL Railway assigns, e.g. `https://api-xxx.railway.app` |
| `WEB_URL`      | Public URL of the web app                                      |
| `ADMIN_URL`    | Public URL of the admin app                                    |

### Optional env vars

| Variable            | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `REVALIDATE_SECRET` | Shared secret with web app for ISR revalidation         |
| `ADMIN_EMAIL`       | Seed admin user email                                   |
| `ADMIN_PASSWORD`    | Seed admin user password (min 8 chars)                  |
| `RESEND_API_KEY`    | For email delivery (magic links, contact notifications) |
| `FROM_EMAIL`        | Sender address for emails                               |
| `ANTHROPIC_API_KEY` | For AI assistant features                               |

### Steps

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway init`
4. Link repo: `railway link`
5. Set env vars in Railway dashboard or via CLI:
   ```sh
   railway variables set DATABASE_URL="<neon-url>" AUTH_SECRET="<secret>" ...
   ```
6. Deploy: `railway up --dockerfile apps/api/Dockerfile`
7. Create first admin user (once deployed):
   ```sh
   railway run --service api pnpm --filter api seed:admin
   ```
   Or set `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars and run locally:
   ```sh
   pnpm --filter api seed:admin
   ```

---

## 3. Web app — Vercel

1. Import repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `apps/web`
3. Vercel auto-detects Next.js; `apps/web/vercel.json` sets the build commands
4. Set env vars:

| Variable              | Description                                 |
| --------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Railway API public URL                      |
| `REVALIDATE_SECRET`   | Same value as the API's `REVALIDATE_SECRET` |

---

## 4. Admin app — Vercel

Same steps as Web, but set **Root Directory** to `apps/admin`.

| Variable              | Description                    |
| --------------------- | ------------------------------ |
| `NEXT_PUBLIC_API_URL` | Railway API public URL         |
| `API_URL`             | Same Railway URL (server-side) |

---

## 5. Post-deploy checklist

- [ ] Visit `/health` on the API — should return `{"status":"ok"}`
- [ ] Visit the admin app, log in with the credentials from `seed:admin`
- [ ] Publish a blog post — confirm the public site updates within 5 seconds (ISR)
- [ ] Submit the contact form — confirm the entry appears in admin
- [ ] Visit `/llms.txt` and `/ai.txt` on the web app — should return plain text manifests
- [ ] Set `REVALIDATE_SECRET` to the same value on both API and Web deployments

---

## Updating env vars

Update Railway: `railway variables set KEY=value`

Update Vercel: Project → Settings → Environment Variables → Add.
After changing `NEXT_PUBLIC_*` vars, redeploy the Vercel app.
