CREATE TABLE `ocorrencias` (
	`id_ocorrencia` int AUTO_INCREMENT NOT NULL,
	`ocorre_nome` varchar(100) NOT NULL,
	`ocorre_status` tinyint NOT NULL,
	`ocorre_prioridade` varchar(10) NOT NULL,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`encerrado_em` timestamp,
	`ocorre_obs` varchar(255),
	`componente_id` int NOT NULL,
	`ambiente_id` int NOT NULL,
	CONSTRAINT `ocorrencias_id_ocorrencia` PRIMARY KEY(`id_ocorrencia`)
);
--> statement-breakpoint
CREATE TABLE `ocorrencias_user` (
	`id_ocorrencias_user` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`ocorrencia_id` int NOT NULL,
	`data_atribuicao` timestamp NOT NULL DEFAULT (now()),
	`ocor_user_obs` varchar(150),
	`ocor_user_tipo` tinyint NOT NULL,
	CONSTRAINT `ocorrencias_user_id_ocorrencias_user` PRIMARY KEY(`id_ocorrencias_user`)
);
--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_componente_id_componentes_id_compo_fk` FOREIGN KEY (`componente_id`) REFERENCES `componentes`(`id_compo`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_ambiente_id_ambientes_id_amb_fk` FOREIGN KEY (`ambiente_id`) REFERENCES `ambientes`(`id_amb`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias_user` ADD CONSTRAINT `ocorrencias_user_user_id_users_id_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id_user`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias_user` ADD CONSTRAINT `ocorrencias_user_ocorrencia_id_ocorrencias_id_ocorrencia_fk` FOREIGN KEY (`ocorrencia_id`) REFERENCES `ocorrencias`(`id_ocorrencia`) ON DELETE no action ON UPDATE no action;