CREATE TABLE `ambientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`amb_nome` varchar(100) NOT NULL,
	`amb_tipo` varchar(50) NOT NULL,
	`amb_bloco` varchar(5) NOT NULL,
	`amb_andar` varchar(2) NOT NULL,
	`amb_ativo` boolean NOT NULL DEFAULT true,
	`amb_obs` varchar(100),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`id_user` int NOT NULL,
	CONSTRAINT `ambientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `componentes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`compo_nome` varchar(100) NOT NULL,
	`compo_ativo` boolean NOT NULL DEFAULT true,
	`compo_obs` varchar(150),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`id_amb` int NOT NULL,
	`compo_tipo_id` int NOT NULL,
	CONSTRAINT `componentes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `componentes_tipo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`compo_tipo` varchar(100) NOT NULL,
	CONSTRAINT `componentes_tipo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `test`;--> statement-breakpoint
ALTER TABLE `ambientes` ADD CONSTRAINT `ambientes_id_user_users_id_user_fk` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `componentes` ADD CONSTRAINT `componentes_id_amb_ambientes_id_fk` FOREIGN KEY (`id_amb`) REFERENCES `ambientes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `componentes` ADD CONSTRAINT `componentes_compo_tipo_id_componentes_tipo_id_fk` FOREIGN KEY (`compo_tipo_id`) REFERENCES `componentes_tipo`(`id`) ON DELETE no action ON UPDATE no action;