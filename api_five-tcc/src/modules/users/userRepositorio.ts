import {
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException,

} from '@nestjs/common';
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

    // metodo para dar select na tabela User
    async ListarUser() {
        try {
            return await this.db.select().from(User);
        } catch (error) {
            throw new InternalServerErrorException('Erro ao listar usuários');
        }
    }

    // metodo para dar select na tabela User por id
    async ListarUserId(id: number) {
        try {
            return await this.db.select().from(User).where(eq(User.id_user, id));
        } catch (error) {
            throw new InternalServerErrorException('Erro ao listar usuário por ID');
        }
    }

    // metodo para cadastrar um usuário na tabela User
    async CadastrarUser(CriarUserDto: CreateUserDto) {
        try {
            await this.db.insert(User).values({
                user_nome: CriarUserDto.user_nome,
                user_email: CriarUserDto.user_email,
                user_senha: CriarUserDto.user_senha,
                user_tel: CriarUserDto.user_tel,
                user_tipo: CriarUserDto.user_tipo,
            });

        } catch (error: any) {

            if (error?.cause?.code === 'ER_DUP_ENTRY') {
                throw new BadRequestException('E-mail já cadastrado');
            }

            throw new InternalServerErrorException('Erro ao cadastrar usuário');
        }

    }

    // metodo para atualizar um usuário na tabela User
    async AtualizarUser(id: number, atualizarUserDto: UpdateUserDto) {
        try {


            // Verificar se o usuário existe antes de atualizar
            const user = await this.db.query.User.findFirst({
                where: eq(User.id_user, id),
            });

            if (!user) {
                throw new NotFoundException('Usuário não encontrado');
            }

            // Filtrar apenas os campos que foram enviados para atualização
            const dadosAtualizados = Object.fromEntries(
                Object.entries(atualizarUserDto).filter(([_, value]) => value !== undefined),
            )

            // Verificar se há dados para atualizar
            if (Object.keys(dadosAtualizados).length === 0) {
                throw new InternalServerErrorException(
                    'Nenhum dado enviado para atualização'
                );
            }

            await this.db.
                update(User).
                set(dadosAtualizados)
                .where(eq(User.id_user, id));

            return {
                message: 'Usuário atualizado com sucesso',
            }

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException('Erro ao atualizar usuário');
        }
    }

    // metodo para inativar um usuário na tabela User   
    async AtualizarStatusUser(id: number,) {
        try {

            // Verificar se o usuário existe antes de inativar
            const user = await this.db.query.User.findFirst({
                where: eq(User.id_user, id),
            });

            if (!user) {
                throw new NotFoundException('Usuário não encontrado');
            }

            const novoStatus = !user.user_ativo;

            await this.db
                .update(User)
                .set({ user_ativo: novoStatus })
                .where(eq(User.id_user, id));
            return {
                message: `Usuário ${user.user_ativo ? 'inativado' : 'ativado'} com sucesso`,
            }

        } catch (error) {
            throw error;
        }
    }

    // metodo para listar os usuários desativados na tabela User
    async listarStatusUser() {
        try {
            return await this.db.select().from(User).where(eq(User.user_ativo, false));
        } catch (error) {
            throw new InternalServerErrorException('Erro ao listar usuários desativados');
        }
    }


    async VerificarEmailExistente(email: string) {

        try {
            return await this.db.query.User.findFirst({
                where: eq(User.user_email, email),
            });

        } catch (error) {
            throw new InternalServerErrorException('Erro ao verificar email existente');
        }

    }

    async visualizarPerfilUser(id_user: number) {

        try {
            const usuario = await this.db
                .select({
                    id_user: User.id_user,
                    user_nome: User.user_nome,
                    user_email: User.user_email,
                    user_telefone: User.user_tel,
                    user_tipo: User.user_tipo,
                    user_ativo: User.user_ativo,

                })
                .from(User)
                .where(eq(User.id_user, id_user))
                .limit(1)

            if (usuario.length === 0) {
                throw new NotFoundException('Usuário não encontrado');
            }

            return usuario[0];

        } catch (error) {
            throw new InternalServerErrorException('Erro ao visualizar perfil do usuário');
        }

    }


    async atualizarPerfil(id_user: number, dto: AtualizarPerfilDto) {

        try {

            const usuario = await this.db
                .select()
                .from(User)
                .where(eq(User.id_user, id_user))
                .limit(1);

            if (usuario.length === 0) {
                throw new NotFoundException('Usuário não encontrado');
            }

            await this.db
                .update(User)
                .set({
                    user_nome: dto.user_nome,
                    user_email: dto.user_email,
                    user_tel: dto.user_telefone,
                })
                .where(eq(User.id_user, id_user));

            return {
                message: 'Perfil atualizado com sucesso',
            };

        } catch (error) {
            throw new InternalServerErrorException('Erro ao atualizar perfil do usuário');
        }

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

}