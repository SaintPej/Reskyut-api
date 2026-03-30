import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Adoption Application ──────────────────────────────────────────────────

export const adoptionApplication = pgTable("adoption_application", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Personal Info
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  gmailName: text("gmail_name"),
  email: text("email").notNull(),
  birthdate: text("birthdate").notNull(),
  occupation: text("occupation").notNull(),
  companyName: text("company_name"),
  socialMediaProfile: text("social_media_profile"),

  // Identity
  status: text("status").notNull(), // Single, Married, Others
  pronouns: text("pronouns").notNull(), // She/Her, He/Him, They/Them

  // Adoption Motivation
  whatPromptedToAdopt: text("what_prompted_to_adopt").notNull(),
  adoptedBefore: text("adopted_before").notNull(),

  // Pet Preference
  petType: text("pet_type").notNull(), // Cat, Dog, Both, Not Decided
  specificAnimal: boolean("specific_animal").notNull().default(false),
  idealPetDescription: text("ideal_pet_description"),

  // Living Situation
  homeType: text("home_type").notNull(), // House, Condo, Apartment, Other
  renting: boolean("renting").notNull().default(false),
  relocationPlan: text("relocation_plan"),
  householdMembers: text("household_members"), // JSON array stored as text
  allergies: boolean("allergies").notNull().default(false),

  // Responsibility
  caretaker: text("caretaker").notNull(),
  financialResponsibility: text("financial_responsibility").notNull(),
  emergencyCaretaker: text("emergency_caretaker").notNull(),
  hoursAlone: text("hours_alone").notNull(),
  introductionPlan: text("introduction_plan"),

  // Household Decision
  familySupport: boolean("family_support").notNull().default(true),
  familySupportExplanation: text("family_support_explanation"),
  otherPets: boolean("other_pets").notNull().default(false),
  pastPets: boolean("past_pets").notNull().default(false),

  // Uploads (stored as URLs)
  houseFront: text("house_front"),
  street: text("street"),
  livingRoom: text("living_room"),
  diningArea: text("dining_area"),
  kitchen: text("kitchen"),
  bedroom: text("bedroom"),
  windows: text("windows"),
  yard: text("yard"),
  validID: text("valid_id"),

  // Interview
  meetAndGreetAvailable: boolean("meet_and_greet_available")
    .notNull()
    .default(true),
  preferredDate: text("preferred_date"),
  preferredTime: text("preferred_time"),

  // Scoring
  totalScore: integer("total_score").default(0),
  scoreCategory: text("score_category"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
