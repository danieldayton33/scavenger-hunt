CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "accounts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" varchar(255) NOT NULL,
	"userId" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"credentialPublicKey" varchar(255) NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" varchar(255) NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" varchar(255),
	CONSTRAINT "authenticator_pk" PRIMARY KEY("userId","credentialID")
);
--> statement-breakpoint
CREATE TABLE "hunt_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hunt_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"huntId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"hint" text,
	"imageUrl" varchar(1024),
	"itemType" text NOT NULL,
	"lat" numeric(10, 7) NOT NULL,
	"lng" numeric(10, 7) NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hunt_participants" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hunt_participants_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"huntId" integer NOT NULL,
	"userId" varchar(255) NOT NULL,
	"joinedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scavenger_hunts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "scavenger_hunts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"startAt" timestamp with time zone NOT NULL,
	"endAt" timestamp with time zone NOT NULL,
	"createdBy" varchar(255) NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scavenger_hunts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "submissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"huntId" integer NOT NULL,
	"itemId" integer NOT NULL,
	"userId" varchar(255) NOT NULL,
	"imageUrl" varchar(1024),
	"comment" text,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"accuracyMeters" numeric(8, 2),
	"status" "status" DEFAULT 'approved' NOT NULL,
	"submittedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp with time zone,
	"image" varchar(1024),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hunt_items" ADD CONSTRAINT "hunt_items_huntId_scavenger_hunts_id_fk" FOREIGN KEY ("huntId") REFERENCES "public"."scavenger_hunts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hunt_participants" ADD CONSTRAINT "hunt_participants_huntId_scavenger_hunts_id_fk" FOREIGN KEY ("huntId") REFERENCES "public"."scavenger_hunts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hunt_participants" ADD CONSTRAINT "hunt_participants_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scavenger_hunts" ADD CONSTRAINT "scavenger_hunts_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_huntId_scavenger_hunts_id_fk" FOREIGN KEY ("huntId") REFERENCES "public"."scavenger_hunts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_itemId_hunt_items_id_fk" FOREIGN KEY ("itemId") REFERENCES "public"."hunt_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "provider_providerAccountId_idx" ON "accounts" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE UNIQUE INDEX "authenticator_credentialID_uq" ON "authenticator" USING btree ("credentialID");--> statement-breakpoint
CREATE INDEX "authenticator_userId_idx" ON "authenticator" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "items_by_hunt_idx" ON "hunt_items" USING btree ("huntId");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_hunt_user" ON "hunt_participants" USING btree ("huntId","userId");--> statement-breakpoint
CREATE INDEX "participants_by_user_idx" ON "hunt_participants" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "hunts_by_window_idx" ON "scavenger_hunts" USING btree ("startAt","endAt");--> statement-breakpoint
CREATE INDEX "hunts_by_creator_idx" ON "scavenger_hunts" USING btree ("createdBy");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_hunt_item_user" ON "submissions" USING btree ("huntId","itemId","userId");--> statement-breakpoint
CREATE INDEX "sub_by_hunt_idx" ON "submissions" USING btree ("huntId");--> statement-breakpoint
CREATE INDEX "sub_by_user_idx" ON "submissions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "sub_hunt_submit_idx" ON "submissions" USING btree ("huntId","submittedAt","id");