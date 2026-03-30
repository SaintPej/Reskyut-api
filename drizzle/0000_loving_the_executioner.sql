CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adoption_application" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"gmail_name" text,
	"email" text NOT NULL,
	"birthdate" text NOT NULL,
	"occupation" text NOT NULL,
	"company_name" text,
	"social_media_profile" text,
	"status" text NOT NULL,
	"pronouns" text NOT NULL,
	"what_prompted_to_adopt" text NOT NULL,
	"adopted_before" text NOT NULL,
	"pet_type" text NOT NULL,
	"specific_animal" boolean DEFAULT false NOT NULL,
	"ideal_pet_description" text,
	"home_type" text NOT NULL,
	"renting" boolean DEFAULT false NOT NULL,
	"relocation_plan" text,
	"household_members" text,
	"allergies" boolean DEFAULT false NOT NULL,
	"caretaker" text NOT NULL,
	"financial_responsibility" text NOT NULL,
	"emergency_caretaker" text NOT NULL,
	"hours_alone" text NOT NULL,
	"introduction_plan" text,
	"family_support" boolean DEFAULT true NOT NULL,
	"family_support_explanation" text,
	"other_pets" boolean DEFAULT false NOT NULL,
	"past_pets" boolean DEFAULT false NOT NULL,
	"house_front" text,
	"street" text,
	"living_room" text,
	"dining_area" text,
	"kitchen" text,
	"bedroom" text,
	"windows" text,
	"yard" text,
	"valid_id" text,
	"meet_and_greet_available" boolean DEFAULT true NOT NULL,
	"preferred_date" text,
	"preferred_time" text,
	"total_score" integer DEFAULT 0,
	"score_category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_application" ADD CONSTRAINT "adoption_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;