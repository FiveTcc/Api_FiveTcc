import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { test, User } from "src/db/schemas";
import { eq } from 'drizzle-orm';
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";

@Injectable()
export class ComponenteRepository {
   constructor(
      @Inject(DRIZZLE) private readonly db: DrizzleDB,) { }

   // Método para dar select na tabela componente
   async ListarComponente() {
      try {
         return await this.db.select().from(test);  // Alterar para tabela de componente quando for criada
      } catch (error) {
         throw new InternalServerErrorException('Erro ao listar componentes')
      }
   }

   // Método para dar select na tabela componente por id
   async ListarComponenteId(id: number) {
      try {
         return await this.db.select().from(test).where(eq(test.id, id)); // Alterar para tabela de componente quando for criada, e mudar id para algo como 'id_componente'
      } catch (error) {
        throw new InternalServerErrorException('Erro ao listar componente por ID');
      }
   }

   // Método para cadastrar um componente na tabela componente
   async CadastrarComponente(bodyRequest: any)  {
      /*try {
         await this.db.insert(componente).values(bodyRequest);


      } catch (error) {
         
      }*/
   }
}