import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  CITIES,
  InsertLegalLead,
  InsertUser,
  LegalCategory,
  City,
  lawyerProfiles,
  leads,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Connexion différée pour laisser fonctionner les outils locaux sans base configurée.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function createLegalLead(input: InsertLegalLead) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(leads).values(input);
}

export async function getLawyerDashboard(userId: number, isAdmin = false) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const [profile] = await db
    .select()
    .from(lawyerProfiles)
    .where(eq(lawyerProfiles.userId, userId))
    .limit(1);

  if (!profile) return { profile: null, leads: [] as const };
  if (!profile.verified && !isAdmin) return { profile, leads: [] as const };

  const matchingLeads = await db
    .select()
    .from(leads)
    .where(and(eq(leads.city, profile.city), eq(leads.category, profile.specialty)))
    .orderBy(desc(leads.createdAt))
    .limit(50);

  // Ne jamais sérialiser les coordonnées à un avocat non abonné.
  const safeLeads = matchingLeads.map(lead => {
    const { contactName, contactPhone, contactEmail, ...caseDetails } = lead;
    return {
      ...caseDetails,
      contact: profile.subscriptionActive
        ? { name: contactName, phone: contactPhone, email: contactEmail }
        : null,
    };
  });

  return { profile, leads: safeLeads };
}

export async function saveLawyerPreferences(userId: number, city: City, specialty: LegalCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  await db
    .insert(lawyerProfiles)
    .values({ userId, city, specialty, verified: false, subscriptionActive: false })
    .onDuplicateKeyUpdate({ set: { city, specialty } });
}

export async function activateDemoSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  return db
    .update(lawyerProfiles)
    .set({ subscriptionActive: true })
    .where(eq(lawyerProfiles.userId, userId));
}

export async function getLawyerVerificationQueue() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  return db
    .select({
      profileId: lawyerProfiles.id,
      lawyerName: users.name,
      email: users.email,
      city: lawyerProfiles.city,
      specialty: lawyerProfiles.specialty,
      createdAt: lawyerProfiles.createdAt,
    })
    .from(lawyerProfiles)
    .innerJoin(users, eq(lawyerProfiles.userId, users.id))
    .where(eq(lawyerProfiles.verified, false))
    .orderBy(desc(lawyerProfiles.createdAt));
}

export async function setLawyerVerified(profileId: number, verified: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.update(lawyerProfiles).set({ verified }).where(eq(lawyerProfiles.id, profileId));
}
