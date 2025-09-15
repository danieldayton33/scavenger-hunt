# Scavenger Hunt App — Starter Blueprint

Tech stack: **Next.js (App Router)**, **TypeScript**, **Drizzle ORM (MySQL/MariaDB)**, **NextAuth v5**, **Tailwind CSS**, **shadcn/ui**, **pnpm**.

> This is a practical scaffold: commands, folder layout, environment, DB schema, auth, middleware, API routes, and a few UI screens to get you shipping quickly.

---

## 1) Create the project & install deps

```bash
# Create Next.js app
pnpm create next-app scavenger-hunt --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"
cd scavenger-hunt

# Core deps
pnpm add drizzle-orm mysql2 drizzle-kit zod date-fns

# Auth
pnpm add next-auth @auth/drizzle-adapter jose

# UI
pnpm add class-variance-authority clsx lucide-react tailwind-merge

# Dev types
pnpm add -D @types/node @types/react @types/react-dom
```

### Tailwind init check

The Next.js starter already sets up Tailwind. Ensure `tailwind.config.ts` has `content: ["./src/**/*.{ts,tsx}"]` and add shadcn in the next step.

---

## 2) Set up shadcn/ui

```bash
# add the CLI
pnpm dlx shadcn@latest init
# choose 'src' directory when prompted

# Add common components
pnpm dlx shadcn@latest add button card input textarea label form toast dropdown-menu avatar badge table alert-dialog dialog sheet select checkbox skeleton tabs navigation-menu toast scroll-area separator
```

Update global CSS fonts/utilities as you prefer. Tailwind is already enabled.

---

## 3) Drizzle config (MySQL/MariaDB)

> You’ve used MariaDB before — this starter uses **mysql2** driver (works with MySQL or MariaDB).

**`drizzle.config.ts`**

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
});
```

**`.env.example`**

```env
# MySQL / MariaDB connection string
# Format: mysql://USER:PASSWORD@HOST:PORT/DB_NAME
DATABASE_URL="mysql://root:password@localhost:3306/scavenger_hunt"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="changeme-super-secret"
# Example OAuth (optional)
GITHUB_ID=""
GITHUB_SECRET=""
```

Add the real `.env.local` with your values.

---

## 4) Database schema with Drizzle

**Key entities**

* `users` (with role: `admin` | `user`)
* `scavengerHunts` (title, description, start/end window)
* `huntItems` (lat, lng, hint, image, title, description, order)
* `huntParticipants` (users who joined a hunt within time window)
* `submissions` (image, geolocation from browser, comment, status)

**`src/db/schema.ts`**

```ts
import {
  mysqlTable, serial, varchar, text, int, datetime, index, mysqlEnum, boolean,
  decimal
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// Users table compatible with NextAuth Drizzle Adapter expectations (custom minimal version)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: datetime("email_verified"),
  image: varchar("image", { length: 1024 }),
  role: mysqlEnum("role", ["admin", "user"]).default("user").notNull(),
  createdAt: datetime("created_at").defaultNow().notNull(),
  updatedAt: datetime("updated_at").defaultNow().notNull(),
});

export const accounts = mysqlTable("accounts", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: int("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
}, (table) => ({
  userIdx: index("accounts_user_idx").on(table.userId),
  providerProviderAccountIdIdx: index("provider_providerAccountId_idx").on(table.provider, table.providerAccountId),
}));

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionToken: varchar("session_token", { length: 255 }).notNull(),
  userId: int("user_id").notNull(),
  expires: datetime("expires").notNull(),
}, (table) => ({
  sessionTokenIdx: index("session_token_idx").on(table.sessionToken),
  userIdx: index("sessions_user_idx").on(table.userId),
}));

export const verificationTokens = mysqlTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires: datetime("expires").notNull(),
}, (table) => ({
  tokenIdx: index("token_idx").on(table.token),
  identifierIdx: index("identifier_idx").on(table.identifier),
}));

// Core app tables
export const scavengerHunts = mysqlTable("scavenger_hunts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  startAt: datetime("start_at").notNull(),
  endAt: datetime("end_at").notNull(),
  createdBy: int("created_by").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: datetime("created_at").defaultNow().notNull(),
  updatedAt: datetime("updated_at").defaultNow().notNull(),
}, (table) => ({
  byWindow: index("by_window").on(table.startAt, table.endAt),
  byCreator: index("by_creator").on(table.createdBy),
}));

export const huntItems = mysqlTable("hunt_items", {
  id: serial("id").primaryKey(),
  huntId: int("hunt_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  hint: text("hint"),
  imageUrl: varchar("image_url", { length: 1024 }),
  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: datetime("created_at").defaultNow().notNull(),
}, (table) => ({
  byHunt: index("by_hunt").on(table.huntId),
}));

export const huntParticipants = mysqlTable("hunt_participants", {
  id: serial("id").primaryKey(),
  huntId: int("hunt_id").notNull(),
  userId: int("user_id").notNull(),
  joinedAt: datetime("joined_at").defaultNow().notNull(),
}, (table) => ({
  uniq: index("uniq_hunt_user").on(table.huntId, table.userId),
}));

export const submissions = mysqlTable("submissions", {
  id: serial("id").primaryKey(),
  huntId: int("hunt_id").notNull(),
  itemId: int("item_id").notNull(),
  userId: int("user_id").notNull(),
  imageUrl: varchar("image_url", { length: 1024 }),
  comment: text("comment"),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  accuracyMeters: decimal("accuracy_m", { precision: 8, scale: 2 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("approved").notNull(),
  submittedAt: datetime("submitted_at").defaultNow().notNull(),
}, (table) => ({
  byHunt: index("sub_by_hunt").on(table.huntId),
  byUser: index("sub_by_user").on(table.userId),
  uniqFound: index("uniq_hunt_item_user").on(table.huntId, table.itemId, table.userId),
}));

// Relations (optional helpers)
export const usersRelations = relations(users, ({ many }) => ({
  hunts: many(scavengerHunts),
  submissions: many(submissions),
}));

export const huntsRelations = relations(scavengerHunts, ({ many }) => ({
  items: many(huntItems),
  participants: many(huntParticipants),
  submissions: many(submissions),
}));
```

**`src/db/index.ts`**

```ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL! });
export const db = drizzle(pool);
export * as schema from "./schema";
```

**Migrate**

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

> Add a small seed to create an initial admin.

**`scripts/seed.ts`**

```ts
import "dotenv/config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const email = "admin@example.com";
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (!existing.length) {
    await db.insert(users).values({ email, name: "Admin", role: "admin" });
  }
}
main().then(() => process.exit(0));
```

Add script:

```jsonc
// package.json
{
  "scripts": {
    "db:gen": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

---

## 5) NextAuth v5 with Drizzle Adapter

**`src/auth/config.ts`**

```ts
import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import * as schema from "@/db/schema";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: number;
      role: "admin" | "user";
    };
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: DrizzleAdapter(db, schema) as any,
  session: { strategy: "database" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = Number(user.id);
        (session.user as any).role = (user as any).role ?? "user";
      }
      return session;
    },
  },
});
```

**Routes**

```
src/app/api/auth/[...nextauth]/route.ts  -> export { GET, POST } from "@/auth/config";
```

> To promote a user to admin, update their `users.role` to `admin` in DB (seed or admin UI).

---

## 6) Role-based protection (middleware)

**`src/middleware.ts`**

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/*
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## 7) API routes (App Router)

### Create & list hunts (admin)

**`src/app/api/hunts/route.ts`**

```ts
import { auth } from "@/auth/config";
import { db } from "@/db";
import { scavengerHunts } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const HuntSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
  isPublished: z.boolean().default(false),
});

export async function GET() {
  const now = new Date();
  const rows = await db.select().from(scavengerHunts);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const body = await req.json();
  const data = HuntSchema.parse(body);
  const [created] = await db.insert(scavengerHunts).values({
    ...data,
    startAt: new Date(data.startAt),
    endAt: new Date(data.endAt),
    createdBy: session.user.id,
  }).returning();
  return NextResponse.json(created, { status: 201 });
}
```

### Items for a hunt (admin)

**`src/app/api/hunts/[huntId]/items/route.ts`**

```ts
import { auth } from "@/auth/config";
import { db } from "@/db";
import { huntItems } from "@/db/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

const ItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  hint: z.string().optional(),
  imageUrl: z.string().url().optional(),
  lat: z.number(),
  lng: z.number(),
  sortOrder: z.number().int().default(0),
});

export async function POST(
  req: Request,
  { params }: { params: { huntId: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") return new NextResponse("Forbidden", { status: 403 });
  const body = await req.json();
  const data = ItemSchema.parse(body);
  const [created] = await db.insert(huntItems).values({
    ...data,
    huntId: Number(params.huntId),
  }).returning();
  return NextResponse.json(created, { status: 201 });
}
```

### Join a hunt (user)

**`src/app/api/hunts/[huntId]/join/route.ts`**

```ts
import { auth } from "@/auth/config";
import { db } from "@/db";
import { huntParticipants, scavengerHunts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(_: Request, { params }: { params: { huntId: string } }) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const huntId = Number(params.huntId);
  const [hunt] = await db.select().from(scavengerHunts).where(eq(scavengerHunts.id, huntId));
  if (!hunt) return new NextResponse("Not found", { status: 404 });

  const now = new Date();
  if (now < new Date(hunt.startAt) || now > new Date(hunt.endAt)) {
    return new NextResponse("Hunt not active", { status: 400 });
  }

  await db.insert(huntParticipants).values({ huntId, userId: session.user.id }).onDuplicateKeyUpdate({ set: { joinedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
```

### Submit a found item (user)

**`src/app/api/hunts/[huntId]/submissions/route.ts`**

```ts
import { auth } from "@/auth/config";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

const SubmissionSchema = z.object({
  itemId: z.number().int(),
  imageUrl: z.string().url().optional(),
  comment: z.string().max(500).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  accuracyMeters: z.number().optional(),
});

export async function POST(req: Request, { params }: { params: { huntId: string } }) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const data = SubmissionSchema.parse(body);

  const [created] = await db.insert(submissions).values({
    ...data,
    huntId: Number(params.huntId),
    userId: session.user.id,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}
```

### Leaderboard and winner

**`src/app/api/hunts/[huntId]/leaderboard/route.ts`**

```ts
import { db } from "@/db";
import { submissions, huntItems } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// Count approved unique items found per user
export async function GET(_: Request, { params }: { params: { huntId: string } }) {
  const huntId = Number(params.huntId);

  const rows = await db.execute(sql`
    SELECT s.user_id AS userId, COUNT(DISTINCT s.item_id) AS foundCount,
           (SELECT COUNT(*) FROM ${huntItems} hi WHERE hi.hunt_id = ${huntId}) AS totalItems
    FROM ${submissions} s
    WHERE s.hunt_id = ${huntId} AND s.status = 'approved'
    GROUP BY s.user_id
    ORDER BY foundCount DESC
  `);

  return NextResponse.json(rows);
}
```

> Winner rule: **most found**. If multiple tie with `foundCount === totalItems`, the earliest `submittedAt` for the last needed item can be used as tiebreaker (add another query or compute in code).

---

## 8) Minimal pages

### Layout & auth UI

* `src/app/layout.tsx`: include `<Toaster />`, Tailwind container, and a top nav with Sign in/out.
* `src/app/page.tsx`: list **active**, **upcoming**, **past** hunts. CTA to join active hunts.
* `src/app/hunts/[id]/page.tsx`: show items (title, hint, distance if geolocation allowed), join button if not joined, submission form (upload image URL for now), and live leaderboard.
* `src/app/admin/hunts/new/page.tsx`: form to create a hunt, then a secondary step to add items.

### Example: client util to get browser geolocation

**`src/lib/geolocate.ts`**

```ts
export async function getBrowserLocation(): Promise<GeolocationPosition | null> {
  if (!("geolocation" in navigator)) return null;
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
      enableHighAccuracy: true, timeout: 8000, maximumAge: 0,
    });
  }) as Promise<GeolocationPosition | null>;
}
```

### Example: Submit form snippet (client component)

```tsx
"use client";
import { useState } from "react";
import { Button, Input, Textarea } from "@/components/ui"; // map to actual shadcn imports
import { getBrowserLocation } from "@/lib/geolocate";

export function SubmitFoundItem({ huntId, itemId }: { huntId: number; itemId: number }) {
  const [imageUrl, setImageUrl] = useState("");
  const [comment, setComment] = useState("");

  async function onSubmit() {
    const pos = await getBrowserLocation();
    const payload: any = { itemId, imageUrl, comment };
    if (pos) {
      payload.lat = pos.coords.latitude;
      payload.lng = pos.coords.longitude;
      payload.accuracyMeters = pos.coords.accuracy;
    }
    await fetch(`/api/hunts/${huntId}/submissions`, { method: "POST", body: JSON.stringify(payload) });
  }

  return (
    <div className="space-y-2">
      <Input placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <Textarea placeholder="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
      <Button onClick={onSubmit}>Submit</Button>
    </div>
  );
}
```

---

## 9) Leaderboard logic (UI)

At `/hunts/[id]`, poll `/api/hunts/[id]/leaderboard` and render a table:

* **User** (name or email)
* **Found** `foundCount / totalItems`
* Optionally show a small progress bar badge

Add server-side helper to resolve userId to `users.name`.

---

## 10) Winner computation cron (optional)

When the window ends (`endAt`), compute the winner and persist it to a `hunt_winners` table, or compute on-demand:

* If multiple tied with `foundCount === totalItems`, select the one whose **max(submittedAt)** (for their last needed item) is the earliest.
* Else, highest `foundCount` wins.

You can run a **server action** or a scheduled job (Vercel cron) to materialize winners nightly.

---

## 11) Nice-to-haves next

* Uploads: integrate **uploadthing** or S3 for real images.
* Maps: add MapLibre/Leaflet to preview item locations and distance to target.
* Admin: bulk CSV upload for items; reorder items by drag-and-drop.
* Anti-cheat: server-side distance validation to item coordinates (within N meters).
* Moderation: set `submissions.status = pending` and add admin review queue.
* Slugs: generate unique `slug` from title.
* Emails: notify participants when a hunt starts/ends.

---

## 12) Scripts & quality

**`package.json` additions**

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:gen": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

---

## 13) Folder layout

```
src/
  app/
    api/
      auth/[...nextauth]/route.ts
      hunts/route.ts
      hunts/[huntId]/
        items/route.ts
        submissions/route.ts
        leaderboard/route.ts
      (more endpoints as needed)
    admin/
      hunts/new/page.tsx
    hunts/[id]/page.tsx
    page.tsx
    layout.tsx
  auth/config.ts
  db/
    index.ts
    schema.ts
  lib/
    geolocate.ts
    utils.ts
  components/
    SubmitFoundItem.tsx
    (shadcn components live under components/ui/*)
```

---

## 14) Security & validations

* Validate **window** (now ∈ \[startAt, endAt]) when joining or submitting.
* Validate **uniqueness**: a user gets credit for an item once (use DISTINCT count by `item_id`).
* Consider **rate limiting** submissions.
* Sanitize user text (comment) length & content.

---

## 15) Admin workflows

* Create hunt → add items → publish.
* Review queue for submissions (if moderation enabled) with Approve/Reject.
* Export leaderboard CSV.

---

That’s a solid, production-grade starting point tuned to your stack. You can paste these files into a fresh repo and iterate.
