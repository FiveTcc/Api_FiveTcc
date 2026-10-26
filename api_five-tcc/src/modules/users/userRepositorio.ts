import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/database/database.constants';
import { User } from 'src/db/schemas';
import type { DrizzleDB } from 'src/db/types/drizzleDB';
import { CreateUserDto } from './dtos/userDto';
import { UpdateUserDto } from './dtos/userUpdateDto';
import { AtualizarPerfilDto } from './dtos/userDtoPefil';


@Injectable()
export class UserRepositorio {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDB,) { }


    // Colunas devolvidas ao cliente (nunca inclui user_senha)
    private readonly colunasPublicas = {
        id_user: User.id_user,
        user_nome: User.user_nome,
        user_email: User.user_email,
        user_tel: User.user_tel,
        user_tipo: User.user_tipo,
        user_ativo: User.user_ativo,
        user_imagem_url: User.user_imagem_url,
        criado_em: User.criado_em,
        atualizado_em: User.atualizado_em,
    };


    // metodo para dar select na tabela User
    async ListarUser() {
        return await this.db
            .select(this.colunasPublicas)
            .from(User);
    }

    // metodo para dar select na tabela User por id
    async ListarUserId(id: number) {
        const [user] = await this.db
            .select(this.colunasPublicas)
            .from(User)
            .where(eq(User.id_user, id));
        return user;
    }

    // metodo para cadastrar um usuário na tabela User
    async CadastrarUser(CriarUserDto: CreateUserDto) {
        await this.db
            .insert(User)
            .values({
                user_nome: CriarUserDto.user_nome,
                user_email: CriarUserDto.user_email,
                user_senha: CriarUserDto.user_senha,
                user_tel: CriarUserDto.user_tel,
                user_tipo: CriarUserDto.user_tipo,
            });
    }

    // metodo para atualizar um usuário na tabela User
    async AtualizarUser(id: number, atualizarUserDto: UpdateUserDto) {
        await this.db.
            update(User).
            set(atualizarUserDto)
            .where(eq(User.id_user, id));
    }

    // metodo para inativar um usuário na tabela User   
    async AtualizarStatusUser(id: number, ativo: boolean) {
        await this.db
            .update(User)
            .set({ user_ativo: ativo })
            .where(eq(User.id_user, id));
    }

    // metodo para listar os usuários desativados na tabela User
    async listarStatusUser() {
        return await this.db
            .select(this.colunasPublicas)
            .from(User)
            .where(eq(User.user_ativo, false));
    }

    async visualizarPerfilUser(id_user: number) {
        const [usuario] = await this.db
            .select({
                id_user: User.id_user,
                user_nome: User.user_nome,
                user_email: User.user_email,
                user_telefone: User.user_tel,
                user_tipo: User.user_tipo,
                user_ativo: User.user_ativo,
                user_imagem: User.user_imagem_url
            })
            .from(User)
            .where(eq(User.id_user, id_user))
            .limit(1)

        return usuario;
    }


    async atualizarPerfil(id_user: number, dto: AtualizarPerfilDto) {
        await this.db
            .update(User)
            .set({
                user_nome: dto.user_nome,
                user_email: dto.user_email,
                user_tel: dto.user_telefone,
            })
            .where(eq(User.id_user, id_user));
    }

    async atualizarSenha(
        id_user: number,
        senhaHash: string,
    ) {
        await this.db
            .update(User)
            .set({
                user_senha: senhaHash,
            })
            .where(
                eq(User.id_user, id_user)
            )

    }

    async atualizarFotoPerfil(id_user: number, user_imagem_url: string, user_imagem_public_id?: string) {
        await this.db
            .update(User)
            .set({
                user_imagem_url,
                user_imagem_public_id: user_imagem_public_id ?? null,
            })
            .where(eq(User.id_user, id_user));
    }


    async VerificarEmailExistente(email: string) {
        const [user] = await this.db
            .select()
            .from(User)
            .where(eq(User.user_email, email));
        return user;
    }
}