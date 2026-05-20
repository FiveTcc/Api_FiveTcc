import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/database/database.constants';
import { User } from 'src/db/schemas';
import type { DrizzleDB } from 'src/db/types/drizzleDB';
import { CriarUserDto  } from './userDto';


@Injectable()
export class UserRepositorio {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB, ) {}
 
    // metodo para dar select na tabela User
    async ListarUser() {
        try {
            return await this.db.select().from(User);
        } catch (error) {
            throw new InternalServerErrorException('Erro ao listar usuários');
        }
    }


    // metodo para dar select na tabela User por id
    async ListarUserId (id: number) {
        try{
            return await this.db.select().from(User).where(eq(User.id_user, id));
        }catch (error) {
            throw new InternalServerErrorException('Erro ao listar usuário por ID');
        }
    }






}