CREATE TYPE "public"."hunt_status" AS ENUM('draft', 'published', 'completed');--> statement-breakpoint
ALTER TABLE "scavenger_hunts" ADD COLUMN "status" "hunt_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
UPDATE "scavenger_hunts" SET "status" = 'published' WHERE "isPublished" = true;--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "scavenger_hunts" DROP COLUMN "isPublished";