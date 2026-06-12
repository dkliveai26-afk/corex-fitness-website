# CORE X FITNESS Project Documentation

Last updated: 2026-05-30

## 1. Project Overview

CORE X FITNESS is a premium dark-theme gym website and admin system built for a fitness business. The public website presents gym branding, membership plans, trainer profiles, gallery images, diet/nutrition content, contact details, join/booking flows, and Firebase-backed user authentication.

Main public pages:
- Home
- About
- Plans
- Trainers
- Trainer profile details
- Gallery
- Diet
- Contact
- Login
- Signup

Admin system overview:
- Private admin dashboard at `/private-admin`
- Password-protected admin login at `/private-admin/login`
- Admin dashboard includes gym data, bookings, members, payments/status records, and website content management panels
- Content management is intended to save website content to Firestore and show updates on the public website

## 2. Firebase Setup

Firebase is used for:
- Firebase Authentication
- Firestore website content and app data
- User login/signup/session state
- Forgot Password reset email flow
- Booking/contact/user data syncing

Firebase Storage status:
- Firebase Storage upload dependency is currently avoided because billing/storage setup may not be available.
- Temporary image replacement should use image URL/path fields saved in Firestore.
- Public/local assets are stored under `public/`.

Firebase config file:
- `lib/firebase-config.ts`

Firebase client entry:
- `lib/firebase-client.ts`

Firestore website content system:
- `lib/website-content.ts`
- `lib/website-content-client.ts`
- `lib/firebase-client-writes.ts`
- `lib/firebase-server-store.ts`

Important Firestore document/collection names currently used or expected:
- `websiteContent/main`
- `websiteHero/main`
- `websiteContact/main`
- `websiteFooter/main`
- `websiteOffers`
- `websitePlans`
- `websiteTrainers`
- `websiteGallery`
- `websiteDietPlans`
- `websiteSections`
- `websiteSocialLinks`
- bookings/member/gym data collections through the gym data store modules

## 3. Admin Dashboard Features

Admin dashboard route:
- `/private-admin`

Admin login route:
- `/private-admin/login`

Admin dashboard files:
- `app/private-admin/page.tsx`
- `app/private-admin/login/page.tsx`
- `app/private-admin/login/admin-login-form.tsx`
- `components/admin-dashboard/admin-dashboard-design.tsx`
- `components/admin-dashboard/content-management.tsx`

Admin API routes:
- `app/api/admin/login/route.ts`
- `app/api/admin/logout/route.ts`
- `app/api/admin/change-password/route.ts`
- `app/api/admin/upload/route.ts`

CMS areas included or planned:
- Plans management
- Offers management
- Trainers management
- Gallery management
- Diet management
- Contact management
- Booking management
- Hero/home content management
- Footer/social/contact content management

Plan management goals:
- Add plan
- Delete plan
- Edit title
- Edit description/features
- Edit original MRP
- Edit offer percentage
- Auto-calculate discounted price
- Enable/disable plans
- Reorder plans
- Change button text and badge text
- Save all changes in Firestore

## 4. Current Working Features

Current working items from the latest project state:
- Next.js website pages load locally.
- Public navbar is minimal, text-only, with red active underline.
- Navbar logo is visible on the left side.
- Home page uses Lenis smooth scrolling.
- About, Plans, Trainers, Gallery, Diet, and Contact pages include smooth scroll/reveal behavior components.
- Shared footer is now applied through `PageShell`.
- Home page footer is reused across pages through `components/site/site-footer.tsx`.
- Favicon assets were generated and connected in `app/layout.tsx`.
- Contact page includes Google Maps iframe embed.
- Firebase client config exists and supports Auth/Firestore.
- Login/signup components exist.
- Forgot Password UI/flow exists in auth form.
- Admin password login route exists.
- Booking/contact notification API routes exist.
- SMTP mailer exists for optional email notifications.
- Gym server store supports MongoDB when configured and local fallback behavior when not configured.
- Plan pricing helper exists at `components/site/plan-pricing.ts`.
- Public image and favicon assets exist under `public/`.

## 5. Pending Features

Items that may still need final end-to-end verification or completion:
- Full Firestore-backed CMS editing for every section must be verified from the admin dashboard.
- Add/edit/delete/reorder actions for all CMS sections need careful production QA.
- Image URL/path replacement should be verified for every page using Firestore data.
- Firebase Storage upload flow is intentionally not required for now.
- SMTP email notification requires real SMTP environment variables before live use.
- MongoDB persistence requires `MONGODB_URI` if the server store should use MongoDB instead of local fallback.
- Production deployment URL is not configured inside this local project.
- Admin security should use strong production environment variables before deployment.
- Firestore security rules must be configured in the Firebase console before production use.

## 6. Website Structure

Primary route files:
- Home: `app/page.tsx`
- About: `app/about/page.tsx`
- Plans: `app/plans/page.tsx`
- Trainers: `app/trainers/page.tsx`
- Trainer details: `app/trainers/[slug]/page.tsx`
- Gallery: `app/gallery/page.tsx`
- Diet: `app/diet/page.tsx`
- Contact: `app/contact/page.tsx`
- Login: `app/login/page.tsx`
- Signup: `app/signup/page.tsx`
- User dashboard: `app/dashboard/page.tsx`
- Private admin dashboard: `app/private-admin/page.tsx`
- Private admin login: `app/private-admin/login/page.tsx`

Main component folders:
- `components/home`
- `components/about`
- `components/plans`
- `components/trainers`
- `components/gallery`
- `components/diet`
- `components/contact`
- `components/auth`
- `components/admin-dashboard`
- `components/site`

Shared website shell:
- `components/site/page-shell.tsx`
- `components/site/navbar.tsx`
- `components/site/site-footer.tsx`
- `components/site/footer.tsx`

## 7. Important Files

Core app files:
- `app/layout.tsx` - App metadata, favicon declarations, providers.
- `app/globals.css` - Global styling and Tailwind base styles.
- `next.config.ts` - Next.js configuration.
- `package.json` - Scripts and dependencies.
- `tailwind.config.ts` - Tailwind configuration.
- `tsconfig.json` - TypeScript configuration.

Data/content files:
- `components/site/data.ts` - Shared public image/data constants.
- `components/site/contact-info.ts` - Contact information helpers/constants.
- `components/trainers/trainer-data.ts` - Trainer seed/static data.
- `components/gallery/gallery-data.ts` - Gallery seed/static data.
- `lib/website-content.ts` - Default CMS content, schema helpers, normalizers.
- `lib/website-content-client.ts` - Firestore live content loading/sync.

Firebase/auth files:
- `lib/firebase-config.ts` - Firebase config keys and fallbacks.
- `lib/firebase-client.ts` - Firebase app/auth/firestore client setup.
- `lib/firebase-auth-users.ts` - Auth user helpers.
- `components/auth/auth-provider.tsx` - Auth context/provider.
- `components/auth/firebase-auth-form.tsx` - Login/signup/forgot password form.

Admin files:
- `components/admin-dashboard/admin-dashboard-design.tsx` - Main admin UI.
- `components/admin-dashboard/content-management.tsx` - Admin CMS controls.
- `lib/admin-access.ts` - Admin password validation.
- `lib/auth.ts` - Admin session cookie helpers.

Bookings/gym data:
- `lib/gym-data-models.ts`
- `lib/gym-management-store.ts`
- `lib/gym-server-store.ts`
- `lib/gym-data-connections.ts`
- `app/api/gym-data/route.ts`

Notifications:
- `lib/smtp-mailer.ts`
- `app/api/notifications/admin-email/route.ts`
- `app/api/bookings/confirmation-email/route.ts`

Assets:
- `public/images`
- `public/uploads`
- `public/favicons`
- `public/favicon.ico`

## 8. Recent Changes Log

Recent major changes documented from the current working state:
- Rebranded website from Power House Fitness to CORE X FITNESS.
- Replaced/adjusted navbar logo and footer branding.
- Added minimal text-only navbar with active red underline.
- Added app-wide shared footer using the same Home page footer.
- Added footer consistency through `PageShell`.
- Added social icon improvements earlier in footer/social area.
- Added Google Map iframe to Contact page.
- Added Firebase Auth/Firestore setup.
- Added login/signup/forgot password flow components.
- Added private admin password login.
- Added admin dashboard and CMS panels.
- Added Firestore-backed website content helpers and default content.
- Added plans pricing helper and discount calculations.
- Updated plan cards with MRP/discount pricing system.
- Cleaned extra logo/watermark usage across public pages in stages.
- Improved trainers cards and removed visible image/content seam artifact.
- Added Lenis smooth scrolling and reveal components to public pages.
- Generated favicon assets from CORE X FITNESS red X badge.
- Added favicon metadata to `app/layout.tsx`.
- Created full project backup before final changes.

## 9. Restore Instructions

Backup created at:

`C:\Users\DILKHUSH KUMAR\Documents\corexfitness-backup-before-final-changes-20260530-213645`

To restore from backup:

1. Stop any running dev server.
2. Rename the current working folder to keep it as a temporary copy, for example:
   - From: `C:\Users\DILKHUSH KUMAR\Documents\dog .shop. ankush`
   - To: `C:\Users\DILKHUSH KUMAR\Documents\dog .shop. ankush-current-copy`
3. Copy the backup folder.
4. Rename the copied backup folder to:
   - `C:\Users\DILKHUSH KUMAR\Documents\dog .shop. ankush`
5. Open the restored folder in VS Code/Cursor.
6. Run:

```bash
npm install
npm run dev
```

Do not edit the backup folder directly. Always copy it first, then restore from the copy.

## 10. Local Run Instructions

Open a terminal in:

`C:\Users\DILKHUSH KUMAR\Documents\dog .shop. ankush`

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Default local URLs:

```text
Website: http://127.0.0.1:3003/
Admin login: http://127.0.0.1:3003/private-admin/login
Admin dashboard: http://127.0.0.1:3003/private-admin
```

If port 3003 is busy, Next.js may start on another port. Use the port printed in the terminal.

## 11. Build Instructions

Run lint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

Run production server after build:

```bash
npm run start
```

## 12. Environment Variables

Required or supported environment variable names are listed below without secret values.

Admin/session:
- `ADMIN_EMAIL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

Firebase public client config:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

MongoDB optional server store:
- `MONGODB_URI`
- `MONGODB_DB`

SMTP optional email notifications:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_SECURE`

Site URL:
- `NEXT_PUBLIC_SITE_URL`

Security note:
- Do not commit real secrets to public repositories.
- Keep production admin password and session secret strong.
- Configure Firebase Auth providers and Firestore security rules in the Firebase console before deployment.

## Final Project Structure Summary

```text
app/                         Next.js App Router pages and API routes
components/                  Public UI, auth UI, admin dashboard, shared site shell
data/                        Local JSON/fallback data files when used
lib/                         Firebase, CMS, auth, gym data, server store, notification logic
public/                      Images, uploads, favicons, static assets
tmp/                         Temporary/generated local files
.env.example                 Environment variable template
.env.local                   Local environment values, do not expose publicly
next.config.ts               Next.js configuration
package.json                 Scripts and dependencies
README.md                    Existing project readme
DEPLOY_GUIDE.md              Existing deployment guide
PROJECT_DOCUMENTATION.md     This documentation file
```
