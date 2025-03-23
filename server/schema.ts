//put this in schema.ts
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
  password: text("password").notNull(), // Ensure password exists in schema
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

  // Location Section
  arrondissement: varchar("arrondissement", { length: 100 }).notNull(),
  zone: varchar("zone", { length: 100 }).notNull(),
  rue: varchar("rue", { length: 100 }).notNull(),

  // Owner Section
  cin: varchar("cin", { length: 50 }).notNull(),
  nom: varchar("nom", { length: 100 }).notNull(),
  prenom: varchar("prenom", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  adresse: varchar("adresse", { length: 255 }).notNull(),
  telephone: varchar("telephone", { length: 50 }).notNull(),

  // Bâti Details (Optional)
  surfaceTotale: numeric("surface_totale"),
  surfaceCouverte: numeric("surface_couverte"),
  services: jsonb("services").$type<Array<{ id: string; label?: string }>>(),
  densiteUrbain: densityEnum("densite_urbain"),
  autreService: text("autre_service"),
  taxe: numeric("taxe"),
});
