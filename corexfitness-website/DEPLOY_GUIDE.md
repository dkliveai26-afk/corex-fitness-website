# Deployment Guide

## 1. Prepare Environment

Create production environment variables on your hosting provider.

Required:

```env
ADMIN_EMAIL=focusjournal786@gmail.com
ADMIN_USERNAME=focusjournal786@gmail.com
ADMIN_PASSWORD=replace_with_strong_password
SESSION_SECRET=replace_with_long_random_secret
MONGODB_URI=replace_with_mongodb_connection_string
MONGODB_DB=core_x_fitness
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Build

```bash
npm run build
```

## 4. Start Production Server

```bash
npm run start
```

## 5. Verify Routes

- Website: `/`
- Contact: `/contact`
- Plans: `/plans`
- Admin login: `/private-admin/login`
- Admin dashboard: `/private-admin`
- Shared gym data API: `/api/gym-data`

## 6. Database Notes

The gym management system uses:

- MongoDB when `MONGODB_URI` is configured.
- Local JSON fallback at `data/gym-data-store.json` for development.

For real multi-device production use, configure MongoDB.

## 7. Security Notes

- Keep `ADMIN_PASSWORD` only in environment variables.
- Keep `SESSION_SECRET` long and private.
- Do not expose `.env.local`.
- No admin links are shown in the public navbar.
