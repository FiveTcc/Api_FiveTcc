ALTER TABLE `users` MODIFY COLUMN `user_nome` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `user_email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `user_telefone` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `user_tipo` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `user_senha` varchar(40) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `user_ativo` boolean NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `criado_em` timestamp NOT NULL DEFAULT (now());