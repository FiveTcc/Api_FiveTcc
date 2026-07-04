import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Componentes, } from "src/db/schemas";
import { eq } from 'drizzle-orm';
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { CreateComponenteDto } from "./dtos/create.componenteDto";

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
   async CadastrarComponente(CreateComponenteDto: CreateComponenteDto) {
      try {
         await this.db
            .insert(Componentes)
            .values({
               compo_nome: CreateComponenteDto.compo_nome,
               compo_obs: CreateComponenteDto.compo_obs,
               compo_ativo: CreateComponenteDto.compo_ativo,
               compo_tipo_id: CreateComponenteDto.compo_tipo_id,
               id_amb: CreateComponenteDto.id_amb,
            });

         return {
            message: 'Componente cadastrado com sucesso'
         }


      } catch (error) {
         console.error('Erro ao cadastrar componente:', error);
   throw new InternalServerErrorException();
      }
   }
}