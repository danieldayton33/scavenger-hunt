ALTER TABLE "submissions" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "firebaseUid" varchar(255);--> statement-breakpoint
CREATE INDEX "users_firebase_uid_idx" ON "users" USING btree ("firebaseUid");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_firebaseUid_unique" UNIQUE("firebaseUid");