CREATE TABLE `users` (
	`id_user` int AUTO_INCREMENT NOT NULL,
	`user_nome` varchar(100) NOT NULL,
	`user_email` varchar(255) NOT NULL,
	`user_telefone` varchar(20) NOT NULL,
	`user_tipo` varchar(20) NOT NULL,
	`user_senha` varchar(80) NOT NULL,
	`user_ativo` boolean NOT NULL DEFAULT true,
	CONSTRAINT `users_id_user` PRIMARY KEY(`id_user`),
	CONSTRAINT `users_user_email_unique` UNIQUE(`user_email`)
);
--> statement-breakpoint
CREATE TABLE `ambientes` (
	`id_amb` int AUTO_INCREMENT NOT NULL,
	`amb_nome` varchar(100) NOT NULL,
	`amb_tipo` varchar(50) NOT NULL,
	`amb_bloco` varchar(5) NOT NULL,
	`amb_andar` varchar(2) NOT NULL,
	`amb_ativo` boolean NOT NULL DEFAULT true,
	`amb_obs` varchar(100),
	`id_user` int NOT NULL,
	CONSTRAINT `ambientes_id_amb` PRIMARY KEY(`id_amb`)
);
--> statement-breakpoint
CREATE TABLE `componentes` (
	`id_compo` int AUTO_INCREMENT NOT NULL,
	`compo_nome` varchar(100) NOT NULL,
	`compo_ativo` boolean NOT NULL DEFAULT true,
	`compo_obs` varchar(150),
	`id_amb` int NOT NULL,
	`compo_tipo_id` int NOT NULL,
	CONSTRAINT `componentes_id_compo` PRIMARY KEY(`id_compo`)
);
--> statement-breakpoint
CREATE TABLE `componentes_tipo` (
	`id_compo_tipo` int AUTO_INCREMENT NOT NULL,
	`compo_tipo` varchar(100) NOT NULL,
	CONSTRAINT `componentes_tipo_id_compo_tipo` PRIMARY KEY(`id_compo_tipo`)
);
--> statement-breakpoint
CREATE TABLE `ocorrencias` (
	`id_ocorrencia` int AUTO_INCREMENT NOT NULL,
	`ocorre_nome` varchar(100) NOT NULL,
	`ocorre_status` tinyint NOT NULL,
	`ocorre_prioridade` varchar(10) NOT NULL,
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
	`ocor_user_obs` varchar(150),
	`ocor_user_tipo` tinyint NOT NULL,
	CONSTRAINT `ocorrencias_user_id_ocorrencias_user` PRIMARY KEY(`id_ocorrencias_user`)
);
--> statement-breakpoint
ALTER TABLE `ambientes` ADD CONSTRAINT `ambientes_id_user_users_id_user_fk` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `componentes` ADD CONSTRAINT `componentes_id_amb_ambientes_id_amb_fk` FOREIGN KEY (`id_amb`) REFERENCES `ambientes`(`id_amb`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `componentes` ADD CONSTRAINT `componentes_compo_tipo_id_componentes_tipo_id_compo_tipo_fk` FOREIGN KEY (`compo_tipo_id`) REFERENCES `componentes_tipo`(`id_compo_tipo`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_componente_id_componentes_id_compo_fk` FOREIGN KEY (`componente_id`) REFERENCES `componentes`(`id_compo`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_ambiente_id_ambientes_id_amb_fk` FOREIGN KEY (`ambiente_id`) REFERENCES `ambientes`(`id_amb`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias_user` ADD CONSTRAINT `ocorrencias_user_user_id_users_id_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id_user`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias_user` ADD CONSTRAINT `ocorrencias_user_ocorrencia_id_ocorrencias_id_ocorrencia_fk` FOREIGN KEY (`ocorrencia_id`) REFERENCES `ocorrencias`(`id_ocorrencia`) ON DELETE no action ON UPDATE no action;