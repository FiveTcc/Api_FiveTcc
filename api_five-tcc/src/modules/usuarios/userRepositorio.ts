import {
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/database/database.constants';
import { User } from 'src/db/schemas';
import type { DrizzleDB } from 'src/db/types/drizzleDB';
import { CreateUserDto } from './dtos/userDto';
import { UpdateUserDto } from './dtos/userUpdateDto';


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

        } catch (error) {
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
    async InativarUser(id: number) {
        try {
            await this.db
                .update(User)
                .set({ user_ativo: false })
                .where(eq(User.id_user, id));

            return 'Autor inativado com sucesso';


        } catch (error) {
            throw new InternalServerErrorException('Erro ao inativar usuário');
        }
    }
     
    // metodo para listar os usuários desativados na tabela User
    async listUserDesativado() {
        try {
            return await this.db.select().from(User).where(eq(User.user_ativo, false));
        } catch (error) {
            throw new InternalServerErrorException('Erro ao listar usuários desativados');
        }
    }



}