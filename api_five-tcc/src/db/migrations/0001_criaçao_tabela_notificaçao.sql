CREATE TABLE `notificacoes` (
	`id_notificacao` int AUTO_INCREMENT NOT NULL,
	`id_user` int NOT NULL,
	`titulo` varchar(150) NOT NULL,
	`mensagem` varchar(255) NOT NULL,
	`tipo` enum('NOVA_OCORRENCIA','ALTERACAO_STATUS','ENCERRAMENTO','ALERTA') NOT NULL,
	`id_ocorrencia` int,
	`lida` boolean NOT NULL DEFAULT false,
	`criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `notificacoes_id_notificacao` PRIMARY KEY(`id_notificacao`)
);
--> statement-breakpoint
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_id_user_users_id_user_fk` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_id_ocorrencia_ocorrencias_id_ocorrencia_fk` FOREIGN KEY (`id_ocorrencia`) REFERENCES `ocorrencias`(`id_ocorrencia`) ON DELETE no action ON UPDATE no action;