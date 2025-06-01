import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  varchar,
  pgEnum,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";
import postgres from "postgres";
import { relations } from "drizzle-orm";

import { drizzle } from "drizzle-orm/postgres-js";
import type { AdapterAccountType } from "next-auth/adapters";

const connectionString = "postgres://postgres:postgres@localhost:5432/drizzle";
const pool = postgres(connectionString, { max: 1 });

export const db = drizzle(pool);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"), // Ensure password exists in schema
  role: text("role").default("agent"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);
// db/schema.ts
export const propertyTypeEnum = pgEnum("type_de_propriete", [
  "bati",
  "non bati",
]);
export const oppsitionStatusEnum = pgEnum("status", [
  "active",
  "opposition_pending",
  "opposition_approved",
  "opposition_refused",
]);

export const densityEnum = pgEnum("densite_urbain", [
  "haute",
  "moyenne",
  "basse",
]);

export const articles = pgTable("articles", {
  // General Section
  id: serial("id").primaryKey(),
  typeDePropriete: propertyTypeEnum("type_de_propriete").notNull(),
  dateDebutImposition: varchar("date_debut_imposition").notNull(),
  surfaceTotale: numeric("surface_totale"),
  densiteUrbain: densityEnum("densite_urbain"),

  // Location Section
  arrondissement: varchar("arrondissement", { length: 100 }).notNull(),
  zone: varchar("zone", { length: 100 }).notNull(),
  rue: varchar("rue", { length: 100 }).notNull(),
  x: numeric("latitude").notNull(),
  y: numeric("longitude").notNull(),
  // Owner Section
  cin: varchar("cin", { length: 50 }).notNull(),
  nom: varchar("nom", { length: 100 }).notNull(),
  prenom: varchar("prenom", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  adresse: varchar("adresse", { length: 255 }).notNull(),
  telephone: varchar("telephone", { length: 50 }).notNull(),
  taxe: numeric("taxe"),

  // Bâti Details (Optional)
  surfaceCouverte: numeric("surface_couverte"),
  services: jsonb("services").$type<Array<{ id: string; label?: string }>>(),
  autreService: text("autre_service"),

  archive: boolean("archive").default(false),
  status: oppsitionStatusEnum("status").default("active"),
});

// New opposition table
export const oppositions = pgTable("oppositions", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),

  // The values that can be changed if opposition is approved
  proposedSurfaceCouverte: numeric("proposed_surface_couverte"),
  proposedServices:
    jsonb("proposed_services").$type<Array<{ id: string; label?: string }>>(),
  proposedAutreService: text("proposed_autre_service"),

  // Opposition metadata
  status: oppsitionStatusEnum("status").default("opposition_pending"),
  reason: text("reason").notNull(),
  submittedBy: text("submitted_by")
    .notNull()
    .references(() => users.id),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),

  // Optional: reviewer information
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
});
export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "check",
  "bank_transfer",
  "credit_card",
  "other",
]);

// Payment records table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  amount: numeric("amount").notNull(),
  paymentDate: timestamp("payment_date", { withTimezone: true })
    .defaultNow()
    .notNull(),
  receiptNumber: varchar("receipt_number", { length: 50 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  notes: text("notes"),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
});
// Relations setup
// ... existing imports and table definitions ...

// Add this paymentsRelations definition
// export const paymentsRelations = relations(payments, ({ one }) => ({
//   article: one(articles, {
//     fields: [payments.articleId],
//     references: [articles.id],
//     relationName: "article_payments",
//   }),
//   createdByUser: one(users, {
//     fields: [payments.createdBy],
//     references: [users.id],
//     relationName: "payments_creator", // add unique relationName here
//   }),
// }));

// export const articlesRelations = relations(articles, ({ many }) => ({
//   oppositions: many(oppositions),
//   payments: many(payments, { relationName: "article_payments" }),
// }));

// export const oppositionsRelations = relations(oppositions, ({ one }) => ({
//   article: one(articles, {
//     fields: [oppositions.articleId],
//     references: [articles.id],
//   }),
//   submitter: one(users, {
//     fields: [oppositions.submittedBy],
//     references: [users.id],
//     relationName: "oppositions_submitter", // unique relation name here
//   }),
//   reviewer: one(users, {
//     fields: [oppositions.reviewedBy],
//     references: [users.id],
//     relationName: "oppositions_reviewer", // unique relation name here
//   }),
// }));

// export const usersRelations = relations(users, ({ many }) => ({
//   oppositionsSubmitted: many(oppositions, {
//     relationName: "oppositions_submitter",
//   }),
//   oppositionsReviewed: many(oppositions, {
//     relationName: "oppositions_`reviewer",
//   }),
//   paymentsCreated: many(payments, { relationName: "payments_creator" }),
// }));
