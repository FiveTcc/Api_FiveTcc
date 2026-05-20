CREATE TABLE `users` (
	`id_user` int AUTO_INCREMENT NOT NULL,
	`user_nome` varchar(100),
	`user_email` varchar(255),
	`user_telefone` varchar(20),
	`user_tipo` varchar(20),
	`user_senha` varchar(40),
	`user_ativo` boolean DEFAULT true,
	`atualizado_em` datetime,
	`criado_em` datetime,
	CONSTRAINT `users_id_user` PRIMARY KEY(`id_user`)
);
