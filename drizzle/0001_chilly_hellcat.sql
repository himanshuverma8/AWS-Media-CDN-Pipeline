DROP TABLE "user_usage" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "plan";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "quota_storage";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "quota_bandwidth";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "quota_ai_generations";