CREATE TABLE `ocorrencias_observacoes` (
	`id_obs` int AUTO_INCREMENT NOT NULL,
	`id_ocorrencia` int NOT NULL,
	`id_user` int NOT NULL,
	`obs_texto` text NOT NULL,
	`criada_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `ocorrencias_observacoes_id_obs` PRIMARY KEY(`id_obs`)
);
--> statement-breakpoint
ALTER TABLE `ocorrencias_observacoes` ADD CONSTRAINT `ocorrencias_observacoes_id_ocorrencia_ocorrencias_id_ocorrencia_fk` FOREIGN KEY (`id_ocorrencia`) REFERENCES `ocorrencias`(`id_ocorrencia`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias_observacoes` ADD CONSTRAINT `ocorrencias_observacoes_id_user_users_id_user_fk` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE no action ON UPDATE no action;