# Scavenger Hunt App

A location-based scavenger hunt app where participants join hunts, find items on a map, and submit evidence. Admins create hunts and items; participants join, submit, and compete on a scoreboard.

**Tech stack:** Next.js 16 (App Router), TypeScript, PostgreSQL, Drizzle ORM, NextAuth v5, Tailwind CSS, shadcn/ui, Google Maps (via @vis.gl/react-google-maps).

---

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL
- pnpm (or npm)

### Install and run

```bash
pnpm install
cp .env.example .env.local   # edit with your values
pnpm db:gen
pnpm db:migrate
pnpm db:seed                  # optional: seed admin user
pnpm dev
```

### Environment

Create `.env.local` from `.env.example`. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Secret for session signing |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (optional) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps (for hunt map) |

Auth: **Google** (OAuth) and **Email** (magic link). In development, the email provider logs the magic link to the console; in production it uses Postmark.

---

## Project structure

```
app/
  (common)/                    # Public + signed-in routes
    page.tsx                    # Home: list published hunts
    archive/page.tsx            # Completed hunts
    profile/page.tsx            # User profile (view/edit name; role hidden except for admins)
    layout.tsx
    scavenger-hunt/
      [slug]/page.tsx           # Hunt view: map, sidebar, countdown, scoreboard, join
      [slug]/submission/
        create/page.tsx         # Create submission (by item)
        [id]/edit/page.tsx      # Edit existing submission
  admin/                        # Admin-only (middleware-protected)
    (dashboard)/
      hunts/                    # List, new, [slug] view/edit, hunt-item create/edit
    @modal/                     # Intercepting routes for hunt-item modals
  login/page.tsx
  layout.tsx
auth/
  config.ts                     # NextAuth: Google + Email, Drizzle adapter, session callback
db/
  schema.ts                     # PostgreSQL schema (users, hunts, items, participants, submissions)
  index.ts
drizzle/                       # Migrations
lib/
  api/
    queries/                   # Data fetching (hunts, items, participants, submissions, scoreboard)
    mutations/                 # Server actions (hunts, items, participants, submissions, users)
  schemas/                     # Zod + Drizzle types (hunt, huntItem, submission)
  actions/auth.ts
  constants/
  utils/
components/
  HuntMap.tsx                   # Map with pins/circles, sidebar (participant), item cards
  HuntCardWithSignIn.tsx
  JoinHuntButton.tsx
  Countdown.tsx                 # Reusable countdown to hunt endAt
  Scoreboard.tsx                # Hunt leaderboard (cached)
  ProfileView.tsx / ProfileForm.tsx
  SubmissionForm.tsx
  UserMenuOrSignIn.tsx
  ui/                           # shadcn components
```

---

## Database (PostgreSQL + Drizzle)

- **users** — id, name, email, image, role (`admin` \| `user`), timestamps. NextAuth tables: accounts, sessions, verificationTokens, authenticators.
- **scavenger_hunts** — title, slug, description, startAt, endAt, status (`draft` \| `published` \| `completed`), createdBy.
- **hunt_items** — huntId, title, description, hint, imageUrl, lat, lng, sortOrder, itemType.
- **hunt_participants** — huntId, userId, joinedAt.
- **submissions** — huntId, itemId, userId, imageUrl, comment, lat, lng, accuracyMeters, status (`pending` \| `approved` \| `rejected`), submittedAt.

Commands:

```bash
pnpm db:gen      # Generate migrations
pnpm db:migrate  # Run migrations
pnpm db:studio   # Drizzle Studio
pnpm db:seed     # Seed (e.g. admin user)
```

---

## Auth (NextAuth v5)

- **Providers:** Google OAuth; Email magic link (Postmark in production, console in dev).
- **Adapter:** Drizzle with PostgreSQL (users, accounts, sessions, verificationTokens).
- **Session:** Includes `user.id` and `user.role` (`admin` \| `user`). Role is only shown and editable by admins on the profile page.
- **Protection:** Middleware restricts `/admin/*` to `role === 'admin'`.

To promote a user to admin, set `users.role = 'admin'` in the database (or use profile edit when already logged in as an admin).

---

## Main flows

### Participant

1. **Home** — See published hunts; each card shows join state (e.g. “Join” vs “View”).
2. **Hunt page** (`/scavenger-hunt/[slug]`) — Title, countdown to `endAt`, map with item circles (color by submission status), sidebar to pick an item, join button if not a participant.
3. **Map** — Participant view: circles (green/amber/red by approved/pending/not submitted), sidebar list, click item to open card with “Create Submission” or “Edit Submission” link.
4. **Submissions** — Create at `/scavenger-hunt/[slug]/submission/create?itemId=...`; edit at `.../submission/[id]/edit`. Form: image URL, comment, location (optional).
5. **Scoreboard** — Below the map; ranked by distinct approved items, then tie-breakers. Cached (e.g. 3 minutes) and invalidated when submissions change.
6. **Profile** — View name/email; “Edit Profile” toggles to form (name; admins also see role).

### Admin

- **Admin dashboard** — List hunts, create/edit hunts (title, slug, description, start/end, status), manage hunt items (create/edit/delete), view participants.
- **Hunt items** — Modal or page flows for creating/editing items (title, description, hint, lat/lng, etc.).
- **Profile** — Admins can change their own role (user/admin) in addition to name.

---

## Caching

- **Scoreboard** — `getHuntScoreboardNoDuplicateItems` uses Next.js cache components (`'use cache'`, `cacheTag`, `cacheLife`). Cache is invalidated via `revalidateTag(\`scoreboard-${huntId}\`)` when submissions are created or updated.
- **Hunt by slug** — Can use cache tags for revalidation when hunts or related data change.

---

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:gen` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Run seed script |

---

## Security and validation

- **Auth:** All mutation routes/actions check `auth()` and, where needed, `session.user.role === 'admin'`.
- **Submissions:** Create/update validate hunt membership (participant), hunt/item existence, and that the submission belongs to the current user when editing.
- **Profile:** Only the current user’s profile is updated; only admins can change role.
- **Window:** Joining and submitting can be gated by hunt `startAt`/`endAt` and status where applicable.

---

## Optional next steps

- Image uploads (e.g. Uploadthing or S3) instead of image URL only.
- Admin review queue for submissions (pending → approved/rejected).
- Distance checks (server-side) to validate location vs item coordinates.
- Notifications when a hunt starts/ends or submission is approved.
