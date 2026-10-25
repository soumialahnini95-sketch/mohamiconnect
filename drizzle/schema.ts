import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { CITIES, LEGAL_CATEGORIES } from "../shared/legal";

export { CITIES, LEGAL_CATEGORIES } from "../shared/legal";
export type { City, LegalCategory } from "../shared/legal";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** Préférences de ciblage, validation et accès à l’abonnement démo d’un avocat. */
export const lawyerProfiles = mysqlTable("lawyer_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  city: mysqlEnum("city", CITIES).notNull(),
  specialty: mysqlEnum("specialty", LEGAL_CATEGORIES).notNull(),
  verified: boolean("verified").default(false).notNull(),
  subscriptionActive: boolean("subscriptionActive").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Les coordonnées client sont filtrées côté serveur avant sérialisation. */
export const leads = mysqlTable("legal_leads", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("category", LEGAL_CATEGORIES).notNull(),
  city: mysqlEnum("city", CITIES).notNull(),
  description: text("description").notNull(),
  contactName: varchar("contactName", { length: 120 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 40 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LawyerProfile = typeof lawyerProfiles.$inferSelect;
export type LegalLead = typeof leads.$inferSelect;
export type InsertLegalLead = typeof leads.$inferInsert;
