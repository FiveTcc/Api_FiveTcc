CREATE TABLE `users` (
	`id_user` int AUTO_INCREMENT NOT NULL,
	`user_nome` varchar(100) NOT NULL,
	`user_email` varchar(255) NOT NULL,
	`user_telefone` varchar(20) NOT NULL,
	`user_tipo` varchar(20) NOT NULL,
	`user_senha` varchar(80) NOT NULL,
	`user_ativo` boolean NOT NULL DEFAULT true,
	`user_refresh_token` varchar(250),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id_user` PRIMARY KEY(`id_user`),
	CONSTRAINT `users_user_email_unique` UNIQUE(`user_email`),
	CONSTRAINT `users_user_refresh_token_unique` UNIQUE(`user_refresh_token`)
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
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`id_user` int NOT NULL,
	CONSTRAINT `ambientes_id_amb` PRIMARY KEY(`id_amb`)
);
--> statement-breakpoint
CREATE TABLE `componentes` (
	`id_compo` int AUTO_INCREMENT NOT NULL,
	`compo_nome` varchar(100) NOT NULL,
	`compo_ativo` boolean NOT NULL DEFAULT true,
	`compo_obs` varchar(150),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
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
ALTER TABLE `ambientes` ADD CONSTRAINT `ambientes_id_user_users_id_user_fk` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `componentes` ADD CONSTRAINT `componentes_id_amb_ambientes_id_amb_fk` FOREIGN KEY (`id_amb`) REFERENCES `ambientes`(`id_amb`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `componentes` ADD CONSTRAINT `componentes_compo_tipo_id_componentes_tipo_id_compo_tipo_fk` FOREIGN KEY (`compo_tipo_id`) REFERENCES `componentes_tipo`(`id_compo_tipo`) ON DELETE no action ON UPDATE no action;