import { Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Componentes, } from "src/db/schemas";
import { eq, like } from 'drizzle-orm';
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { CreateComponenteDto } from "./dtos/create.componenteDto";
import { UpdateComponenteDto } from "./dtos/updatecomponente";
import { ComponenteTipoRepository } from "../componenteTipo/componenteTipo.repository";
import { Ambientes } from "src/db/schemas/Ambiente";
import { Componentes_tipo } from "src/db/schemas/componentes_tipo";

@Injectable()
export class ComponenteRepository {
   constructor(
      @Inject(DRIZZLE) private readonly db: DrizzleDB, private readonly componenteTipoRepository: ComponenteTipoRepository) { }


   // Método para dar select na tabela componente
   async listarComponente() {
      try {
         return await this.db
            .select()
            .from(Componentes);
      } catch (error) {
         throw new InternalServerErrorException('Erro ao listar componentes')
      }
   }

   // Método para dar select na tabela componente por ID
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
         // verifica se componente existe
         await this.verificaComponenteExiste(id);
         // verifica se o tipo de componente existe
         await this.componenteTipoRepository.verificaTipoComponenteExiste(compoTipoId);

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
   async filtrarPorAmbiente(nomeAmb: string) {
      try {

         const componentes = await this.db
            .select({
               id_compo: Componentes.id_compo,
               compo_nome: Componentes.compo_nome,
               compo_ativo: Componentes.compo_ativo,
               id_amb: Componentes.id_amb,
               nome_ambiente: Ambientes.amb_nome,
            })
            .from(Componentes)
            .leftJoin(
               Ambientes,
               eq(Componentes.id_amb, Ambientes.id_amb),
            )
            .where(
               like(Ambientes.amb_nome, `%${nomeAmb}%`)
            );

         if (componentes.length === 0) {
            throw new NotFoundException(
               'Nenhum componente encontrado para o ambiente informado',
            );
         }

         return componentes;

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
   async filtrarPorTipo(tipo: string) {
      try {

         const componentes = await this.db
            .select({
               id_compo: Componentes.id_compo,
               compo_nome: Componentes.compo_nome,
               compo_ativo: Componentes.compo_ativo,
               tipo_componente: Componentes_tipo.compo_tipo,
            })
            .from(Componentes)
            .leftJoin(
               Componentes_tipo,
               eq(Componentes.compo_tipo_id, Componentes_tipo.id_compo_tipo),
            )
            .where(
               like(Componentes_tipo.compo_tipo, `%${tipo}%`)
            );

         if (componentes.length === 0) {
            throw new NotFoundException(
               'Nenhum componente encontrado para o tipo informado',
            );
         }

         return componentes;

      } catch (error) {

         if (error instanceof NotFoundException) {
            throw error;
         }
         throw new InternalServerErrorException(
            'Erro ao filtrar componentes por tipo',
         );
      }
   }

   // Filtro por nome de componente
   async filtrarPorNome(nome: string) {
      try {

         const componentes =
            await this.db
               .select()
               .from(Componentes)
               .where(like(Componentes.compo_nome, `%${nome}%`))

         if (componentes.length === 0) {
            throw new NotFoundException('Nenhum componente encontrado para o nome informado');
         }

         return componentes

      } catch (error) {
         if (error instanceof NotFoundException) {
            throw error;
         }
         throw new InternalServerErrorException('Erro ao filtrar componente por nome');
      }
   }






   // Método de verificar se o componente existe
   async verificaComponenteExiste(id: number) {

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