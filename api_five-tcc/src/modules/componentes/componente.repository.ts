import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Componentes,} from "src/db/schemas";
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
         return await this.db.select().from(Componentes); 
      } catch (error) {
         throw new InternalServerErrorException('Erro ao listar componentes')
      }
   }

   // Método para dar select na tabela componente por id
   async ListarComponenteId(id: number) {
      try {
         return await this.db.select().from(Componentes).where(eq(Componentes.id_compo, id)); 
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