CREATE TABLE "verification_tokens" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE INDEX "vt_identifier_idx" ON "verification_tokens" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "vt_token_idx" ON "verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "vt_expires_idx" ON "verification_tokens" USING btree ("expires");