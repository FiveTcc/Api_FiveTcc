ALTER TABLE `ocorrencias` MODIFY COLUMN `ocorre_status` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD `encerrado_em` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL;