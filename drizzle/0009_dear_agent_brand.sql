CREATE TABLE "firebase_link_codes" (
	"code" varchar(64) PRIMARY KEY NOT NULL,
	"firebaseUid" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "firebase_link_codes_expires_at_idx" ON "firebase_link_codes" USING btree ("expiresAt");