import {
  mysqlTable,
  varchar,
  text,
  int,
  datetime,
  index,
  mysqlEnum,
  boolean,
  decimal,
  timestamp,
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';

import { relations } from 'drizzle-orm';

// Users table compatible with NextAuth Drizzle Adapter expectations (custom minimal version)
export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: timestamp('emailVerified', {
    mode: 'date',
    fsp: 3,
  }),
  image: varchar('image', { length: 1024 }),
  role: mysqlEnum('role', ['admin', 'user']).default('user').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
// accounts (REMOVE the foreignKey({...}) in the third arg)
export const accounts = mysqlTable(
  'accounts',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 255 }).notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: int('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 }),
  },
  (table) => [
    index('accounts_user_idx').on(table.userId),
    index('provider_providerAccountId_idx').on(table.provider, table.providerAccountId),
  ]
);

// sessions (REMOVE the foreignKey({...}) in the third arg)
export const sessions = mysqlTable(
  'sessions',
  {
    sessionToken: varchar('sessionToken', { length: 255 }).primaryKey().notNull(),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => [
    // optional: you can drop this since PK already indexes sessionToken
    // index("session_token_idx").on(table.sessionToken),
    index('sessions_user_idx').on(table.userId),
  ]
);

// authenticator (REMOVE the foreignKey({...}) in the third arg)
export const authenticators = mysqlTable(
  'authenticator',
  {
    credentialID: varchar('credentialID', { length: 255 }).notNull(),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
    credentialPublicKey: varchar('credentialPublicKey', { length: 255 }).notNull(),
    counter: int('counter').notNull(),
    credentialDeviceType: varchar('credentialDeviceType', { length: 255 }).notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: varchar('transports', { length: 255 }),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.credentialID], name: 'authenticator_pk' }),
    uniqueIndex('authenticator_credentialID_uq').on(table.credentialID),
    index('authenticator_userId_idx').on(table.userId),
  ]
);

export const verificationTokens = mysqlTable(
  'verification_tokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => [
    index('verification_tokens_token_idx').on(table.token),
    index('verification_tokens_identifier_idx').on(table.identifier),
    primaryKey({ columns: [table.identifier, table.token], name: 'verification_tokens_pk' }),
  ]
);

// Core app tables
export const scavengerHunts = mysqlTable(
  'scavenger_hunts',
  {
    id: int('id').autoincrement().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).unique().notNull(), // keep this...
    // ...and delete the uniqueIndex below
    description: text('description'),
    startAt: datetime('startAt').notNull(),
    endAt: datetime('endAt').notNull(),
    createdBy: varchar('createdBy', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isPublished: boolean('isPublished').default(false).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    // REMOVE: uniqueIndex("hunts_slug_uq").on(table.slug),
    index('hunts_by_window_idx').on(table.startAt, table.endAt),
    index('hunts_by_creator_idx').on(table.createdBy),
  ]
);

export const huntItems = mysqlTable(
  'hunt_items',
  {
    id: int('id').autoincrement().primaryKey(),
    huntId: int('huntId')
      .notNull()
      .references(() => scavengerHunts.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    hint: text('hint'),
    imageUrl: varchar('imageUrl', { length: 1024 }),
    lat: decimal('lat', { precision: 10, scale: 7 }).notNull(),
    lng: decimal('lng', { precision: 10, scale: 7 }).notNull(),
    sortOrder: int('sortOrder').default(0).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [index('items_by_hunt_idx').on(table.huntId)]
);

export const huntParticipants = mysqlTable(
  'hunt_participants',
  {
    id: int('id').autoincrement().primaryKey(),
    huntId: int('huntId')
      .notNull()
      .references(() => scavengerHunts.id, { onDelete: 'cascade' }),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joinedAt').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uniq_hunt_user').on(table.huntId, table.userId),
    index('participants_by_user_idx').on(table.userId),
  ]
);

export const submissions = mysqlTable(
  'submissions',
  {
    id: int('id').autoincrement().primaryKey(),
    huntId: int('huntId')
      .notNull()
      .references(() => scavengerHunts.id, { onDelete: 'cascade' }),
    itemId: int('itemId')
      .notNull()
      .references(() => huntItems.id, { onDelete: 'cascade' }),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    imageUrl: varchar('imageUrl', { length: 1024 }),
    comment: text('comment'),
    lat: decimal('lat', { precision: 10, scale: 7 }),
    lng: decimal('lng', { precision: 10, scale: 7 }),
    accuracyMeters: decimal('accuracyMeters', { precision: 8, scale: 2 }),
    status: mysqlEnum('status', ['pending', 'approved', 'rejected']).default('approved').notNull(),
    submittedAt: timestamp('submittedAt').defaultNow().notNull(),
  },
  (table) => [
    index('sub_by_hunt_idx').on(table.huntId),
    index('sub_by_user_idx').on(table.userId),
    uniqueIndex('uniq_hunt_item_user').on(table.huntId, table.itemId, table.userId),
    index('sub_hunt_submit_idx').on(table.huntId, table.submittedAt, table.id),
  ]
);

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

export const submissionsRelations = relations(submissions, ({ one }) => ({
  hunt: one(scavengerHunts, {
    fields: [submissions.huntId],
    references: [scavengerHunts.id],
  }),
  item: one(huntItems, {
    fields: [submissions.itemId],
    references: [huntItems.id],
  }),
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
}));

export const huntItemsRelations = relations(huntItems, ({ one }) => ({
  hunt: one(scavengerHunts, {
    fields: [huntItems.huntId],
    references: [scavengerHunts.id],
  }),
}));
