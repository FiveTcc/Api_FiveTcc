ALTER TABLE `users` DROP INDEX `users_user_refresh_token_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `user_refresh_token`;