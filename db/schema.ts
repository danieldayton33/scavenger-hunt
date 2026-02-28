import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  numeric,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Enums ---
export const roleEnum = pgEnum('role', ['admin', 'user']);
export const statusEnum = pgEnum('status', ['pending', 'approved', 'rejected']);
export const huntStatusEnum = pgEnum('hunt_status', ['draft', 'published', 'completed']);

// --- Users ---
export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: timestamp('emailVerified', { withTimezone: true }),
    image: varchar('image', { length: 1024 }),
    role: roleEnum('role').notNull().default('user'),
    firebaseUid: varchar('firebaseUid', { length: 255 }).unique(),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('users_firebase_uid_idx').on(t.firebaseUid)]
);

// --- Accounts ---
export const accounts = pgTable(
  'accounts',
  {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 255 }).notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
    password: text('password'),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 }),
  },
  (t) => [
    index('accounts_user_idx').on(t.userId),
    index('provider_providerAccountId_idx').on(t.provider, t.providerAccountId),
  ]
);

// --- Sessions ---
export const sessions = pgTable(
  'sessions',
  {
    sessionToken: varchar('sessionToken', { length: 255 }).primaryKey(),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)]
);

// --- Authenticators ---
export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: varchar('credentialID', { length: 255 }).notNull(),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
    credentialPublicKey: varchar('credentialPublicKey', { length: 255 }).notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: varchar('credentialDeviceType', { length: 255 }).notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: varchar('transports', { length: 255 }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.credentialID], name: 'authenticator_pk' }),
    uniqueIndex('authenticator_credentialID_uq').on(t.credentialID),
    index('authenticator_userId_idx').on(t.userId),
  ]
);

// --- Hunts ---
export const scavengerHunts = pgTable(
  'scavenger_hunts',
  {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    imageUrl: varchar('imageUrl', { length: 1024 }),
    startAt: timestamp('startAt', { withTimezone: true }).notNull(),
    endAt: timestamp('endAt', { withTimezone: true }).notNull(),
    createdBy: varchar('createdBy', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
    status: huntStatusEnum('status').notNull().default('draft'),
  },
  (t) => [
    index('hunts_by_window_idx').on(t.startAt, t.endAt),
    index('hunts_by_creator_idx').on(t.createdBy),
  ]
);

// --- Items ---
export const huntItems = pgTable(
  'hunt_items',
  {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    huntId: integer('huntId')
      .notNull()
      .references(() => scavengerHunts.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    hint: text('hint'),
    imageUrl: varchar('imageUrl', { length: 1024 }),
    itemType: text('itemType').notNull(),
    lat: numeric('lat', { precision: 10, scale: 7 }).notNull(),
    lng: numeric('lng', { precision: 10, scale: 7 }).notNull(),
    sortOrder: integer('sortOrder').notNull().default(0),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('items_by_hunt_idx').on(t.huntId)]
);

// --- Participants ---
export const huntParticipants = pgTable(
  'hunt_participants',
  {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    huntId: integer('huntId')
      .notNull()
      .references(() => scavengerHunts.id, { onDelete: 'cascade' }),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joinedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uniq_hunt_user').on(t.huntId, t.userId),
    index('participants_by_user_idx').on(t.userId),
  ]
);

// --- Submissions ---
export const submissions = pgTable(
  'submissions',
  {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    huntId: integer('huntId')
      .notNull()
      .references(() => scavengerHunts.id, { onDelete: 'cascade' }),
    itemId: integer('itemId')
      .notNull()
      .references(() => huntItems.id, { onDelete: 'cascade' }),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    imageUrl: text('imageUrl'),
    comment: text('comment'),
    lat: numeric('lat', { precision: 10, scale: 7 }),
    lng: numeric('lng', { precision: 10, scale: 7 }),
    accuracyMeters: numeric('accuracyMeters', { precision: 8, scale: 2 }),
    status: statusEnum('status').notNull().default('pending'),
    submittedAt: timestamp('submittedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uniq_hunt_item_user').on(t.huntId, t.itemId, t.userId),
    index('sub_by_hunt_idx').on(t.huntId),
    index('sub_by_user_idx').on(t.userId),
    index('sub_hunt_submit_idx').on(t.huntId, t.submittedAt, t.id),
  ]
);

// --- Verification Tokens ---
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
  },
  (t) => [
    index('vt_identifier_idx').on(t.identifier),
    index('vt_token_idx').on(t.token),
    index('vt_expires_idx').on(t.expires),
  ]
);

// --- User devices (push notification tokens) ---
export const userDevices = pgTable(
  'user_devices',
  {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    platform: varchar('platform', { length: 32 }).notNull(), // 'ios' | 'android'
    pushToken: text('pushToken').notNull(),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('lastSeenAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('user_devices_user_platform').on(t.userId, t.platform),
    index('user_devices_user_idx').on(t.userId),
  ]
);

// --- Firebase link codes (one-time codes for account linking) ---
export const firebaseLinkCodes = pgTable(
  'firebase_link_codes',
  {
    code: varchar('code', { length: 64 }).primaryKey(),
    firebaseUid: varchar('firebaseUid', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  },
  (t) => [index('firebase_link_codes_expires_at_idx').on(t.expiresAt)]
);

// --- Relations (so with: { ... } works) ---
export const usersRelations = relations(users, ({ many }) => ({
  hunts: many(scavengerHunts),
  submissions: many(submissions),
  devices: many(userDevices),
}));

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(users, { fields: [userDevices.userId], references: [users.id] }),
}));

export const huntsRelations = relations(scavengerHunts, ({ many }) => ({
  items: many(huntItems),
  participants: many(huntParticipants),
  submissions: many(submissions),
}));

export const huntItemsRelations = relations(huntItems, ({ one }) => ({
  hunt: one(scavengerHunts, { fields: [huntItems.huntId], references: [scavengerHunts.id] }),
}));

export const huntParticipantsRelations = relations(huntParticipants, ({ one }) => ({
  hunt: one(scavengerHunts, { fields: [huntParticipants.huntId], references: [scavengerHunts.id] }),
  user: one(users, { fields: [huntParticipants.userId], references: [users.id] }),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  hunt: one(scavengerHunts, { fields: [submissions.huntId], references: [scavengerHunts.id] }),
  item: one(huntItems, { fields: [submissions.itemId], references: [huntItems.id] }),
  user: one(users, { fields: [submissions.userId], references: [users.id] }),
}));
