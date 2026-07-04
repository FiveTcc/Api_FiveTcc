ALTER TABLE `componentes` DROP FOREIGN KEY `componentes_id_amb_ambientes_id_fk`;
--> statement-breakpoint
ALTER TABLE `componentes` DROP FOREIGN KEY `componentes_compo_tipo_id_componentes_tipo_id_fk`;
--> statement-breakpoint
ALTER TABLE `ambientes` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `componentes` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `componentes_tipo` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `ambientes` ADD PRIMARY KEY(`id_amb`);--> statement-breakpoint
ALTER TABLE `componentes` ADD PRIMARY KEY(`id_compo`);--> statement-breakpoint
ALTER TABLE `componentes_tipo` ADD PRIMARY KEY(`id_compo_tipo`);--> statement-breakpoint
ALTER TABLE `ambientes` ADD `id_amb` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `componentes` ADD `id_compo` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `componentes_tipo` ADD `id_compo_tipo` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `componentes` ADD CONSTRAINT `componentes_id_amb_ambientes_id_amb_fk` FOREIGN KEY (`id_amb`) REFERENCES `ambientes`(`id_amb`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `componentes` ADD CONSTRAINT `componentes_compo_tipo_id_componentes_tipo_id_compo_tipo_fk` FOREIGN KEY (`compo_tipo_id`) REFERENCES `componentes_tipo`(`id_compo_tipo`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ambientes` DROP COLUMN `id`;--> statement-breakpoint
ALTER TABLE `componentes` DROP COLUMN `id`;--> statement-breakpoint
ALTER TABLE `componentes_tipo` DROP COLUMN `id`;