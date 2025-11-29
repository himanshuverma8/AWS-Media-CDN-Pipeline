CREATE TABLE "user_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"s3_Key" varchar(500) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(20) NOT NULL,
	"folder" varchar(500) DEFAULT '' NOT NULL,
	"size" bigint NOT NULL,
	"mime_type" varchar(100),
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_usage" (
	"user_id" uuid NOT NULL,
	"month" varchar(7) NOT NULL,
	"storage" bigint DEFAULT 0 NOT NULL,
	"bandwidth" bigint DEFAULT 0 NOT NULL,
	"transformations" integer DEFAULT 0 NOT NULL,
	"ai_generations" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_usage_user_id_month_pk" PRIMARY KEY("user_id","month")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"plan" varchar(20) DEFAULT 'free' NOT NULL,
	"quota_storage" bigint DEFAULT 5368709120 NOT NULL,
	"quota_bandwidth" bigint DEFAULT 5368709120 NOT NULL,
	"quota_ai_generations" integer DEFAULT 100 NOT NULL,
	"api_key" varchar(64),
	"api_secret" varchar(64),
	"api_key_created_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_api_key_unique" UNIQUE("api_key"),
	CONSTRAINT "users_api_secret_unique" UNIQUE("api_secret")
);
--> statement-breakpoint
ALTER TABLE "user_files" ADD CONSTRAINT "user_files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_usage" ADD CONSTRAINT "user_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_files_user_id" ON "user_files" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_files_folder" ON "user_files" USING btree ("user_id","folder");--> statement-breakpoint
CREATE INDEX "idx_user_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_user_api_key" ON "users" USING btree ("api_key");