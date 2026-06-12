# CORE X FITNESS

Premium gym website and management platform built with Next.js.

## Features

- Public gym website pages: Home, About, Plans, Trainers, Gallery, Diet, Contact
- Plan booking flow with admin dashboard data connection
- Hidden private admin login at `/private-admin/login`
- Admin dashboard for members, bookings, payments, revenue, notifications, settings, and gym sheet
- Shared gym data API at `/api/gym-data`
- MongoDB support through `MONGODB_URI`, with local JSON fallback for development
- Responsive mobile app-style layouts

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill secure values:

```bash
cp .env.example .env.local
```

3. Start development server:

```bash
npm run dev
```

4. Open:

- Website: `http://localhost:3000`
- Admin login: `http://localhost:3000/private-admin/login`
- Admin dashboard: `http://localhost:3000/private-admin`

## Build

```bash
npm run build
```

## Important Environment Variables

- `ADMIN_EMAIL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `MONGODB_URI`
- `MONGODB_DB`
- `NEXT_PUBLIC_SITE_URL`

Do not commit `.env.local`.
