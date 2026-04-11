CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"original_text" text NOT NULL,
	"type" text NOT NULL,
	"url" text,
	"time_text" text,
	"due_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assets_type_check" CHECK ("assets"."type" in ('note', 'link', 'todo'))
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_user_created_at_idx" ON "assets" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "assets_user_type_created_at_idx" ON "assets" USING btree ("user_id","type","created_at");--> statement-breakpoint
CREATE INDEX "assets_user_completed_at_idx" ON "assets" USING btree ("user_id","completed_at");