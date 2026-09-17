CREATE TABLE "partner" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text DEFAULT 'contact' NOT NULL,
	"name" text,
	"email" text,
	"website" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "partner_type_check" CHECK ("type" in ('client_supplier', 'client', 'supplier', 'contact', 'other'))
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"language" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "user_profile_language_check" CHECK ("language" in ('en', 'it'))
);
--> statement-breakpoint
CREATE INDEX "partner_name_idx" ON "partner" USING btree ("name");--> statement-breakpoint
CREATE INDEX "partner_deleted_at_idx" ON "partner" USING btree ("deleted_at");