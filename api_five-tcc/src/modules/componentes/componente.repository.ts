import { Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Componentes, } from "src/db/schemas";
import { eq } from 'drizzle-orm';
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { CreateComponenteDto } from "./dtos/create.componenteDto";
import { UpdateComponenteDto } from "./dtos/updatecomponente";

@Injectable()
export class ComponenteRepository {
   constructor(
      @Inject(DRIZZLE) private readonly db: DrizzleDB,) { }

   // Método para dar select na tabela componente
   async listarComponente() {
      try {
         return await this.db.select().from(Componentes);
      } catch (error) {
         throw new InternalServerErrorException('Erro ao listar componentes')
      }
   }

   // Método para dar select na tabela componente por id
   async listarComponenteId(id: number) {
      try {
         return await this.verificaComponenteExiste(id);
      } catch (error) {
         if (error instanceof NotFoundException) {
            throw error;
         }
         throw new InternalServerErrorException('Erro ao listar componente por ID');
      }
   }

   // Método para cadastrar um componente na tabela componente
   async cadastrarComponente(CreateComponenteDto: CreateComponenteDto) {
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
            message: `Componente cadastrado com sucesso`
         }

      } catch (error) {
         throw new InternalServerErrorException('Erro ao cadastrar componente');
      }
   }

   // Método para atualizar um componente na tabela componente
   async atualizarComponente(id: number, UpdateComponenteDto: UpdateComponenteDto) {
      try {

         await this.verificaComponenteExiste(id);

         await this.db
            .update(Componentes)
            .set({
               ...UpdateComponenteDto
            })
            .where(eq(Componentes.id_compo, id))

         return {
            message: `Componente atualizado com sucesso`
         };
      } catch (error) {

         if (error instanceof NotFoundException) {
            throw error;
         }
         throw new InternalServerErrorException('Erro ao atualizar componente');
      }
   }

   // Método para excluir componente
   async excluirComponente(id: number) {
      try {

         await this.verificaComponenteExiste(id);

         await this.db
            .delete(Componentes)
            .where(eq(Componentes.id_compo, id));

         return {
            message: `Componente excluído com sucesso`
         }

      } catch (error) {

         if (error instanceof NotFoundException) {
            throw error;
         }

         throw new InternalServerErrorException('Erro ao excluir componente');
      }
   }

   // Método para atualizar status do componente
   async atualizarStatusComponente(id: number) {
      try {

         const componente = await this.verificaComponenteExiste(id);

         await this.db
            .update(Componentes)
            .set({
               compo_ativo: !componente.compo_ativo,
            })
            .where(eq(Componentes.id_compo, id));

         return {
            message: `Status do componente atualizado com sucesso`
         }
      } catch (error) {
         if (error instanceof NotFoundException) {
            throw error;
         }

         throw new InternalServerErrorException(
            'Erro ao atualizar o status do componente',
         );
      }
   }

   async associarCompAmb(id: number, idAmb: number) {
      try {

         await this.verificaComponenteExiste(id); // verifica se o componente existe

         // await this.ambienteRepository.verificaAmbienteExiste(idAmb); // exemplo para criar verificação de ambiente

         await this.db
            .update(Componentes)
            .set({
               id_amb: idAmb,
            })
            .where(eq(Componentes.id_compo, id));

         return {
            message: `Componente associado ao ambiente com sucesso`
         };
      } catch (error) {
         if (error instanceof NotFoundException) {
            throw error;
         }

         throw new InternalServerErrorException(
            'Erro ao associar componente ao ambiente',
         );
      }
   }

   async alterarTipoComponente(id: number, compoTipoId: number) {
      try {

         await this.verificaComponenteExiste(id);

         // await this.componenteTipoRepository.verificaTipoExiste(compoTipoId); // exemplo para criar verificação de tipo de componente

         await this.db
            .update(Componentes)
            .set({
               compo_tipo_id: compoTipoId,
            })
            .where(eq(Componentes.id_compo, id));

         return {
            message: 'Tipo do componente atualizado com sucesso',
         };
      } catch (error) {
         if (error instanceof NotFoundException) {
            throw error;
         }

         throw new InternalServerErrorException(
            'Erro ao definir o tipo do componente',
         );
      }
   }


   // ##### Filtros de Componentes #####

   // Filtro por ambiente
   async filtrarPorAmbiente(idAmb: number) {
      try {

         // await this.ambienteRepository.verificaAmbienteExiste(idAmb);

         return await this.db
            .select()
            .from(Componentes)
            .where(eq(Componentes.id_amb, idAmb));

      } catch (error) {

         if (error instanceof NotFoundException) {
            throw error;
         }
         throw new InternalServerErrorException(
            'Erro ao filtrar componentes por ambiente',
         );
      }
   }

   // Filtro por tipo de componente
   async filtrarPorTipo(idTipo: number) {
      try {

         // await this.componenteTipoRepository.verificaTipoExiste(compoTipoId);
         
         return await this.db
            .select()
            .from(Componentes)
            .where(eq(Componentes.compo_tipo_id, idTipo));

      } catch (error) {

         if (error instanceof NotFoundException) {
            throw error;
         }
         throw new InternalServerErrorException(
            'Erro ao filtrar componentes por tipo',
         );
      }
   }





   // Método de verificar se o componente existe
   private async verificaComponenteExiste(id: number) {

      const [componente] = await this.db
         .select()
         .from(Componentes)
         .where(eq(Componentes.id_compo, id));


      if (!componente) {
         throw new NotFoundException(
            'Componente não encontrado'
         );
      }

      return componente;
   }
}