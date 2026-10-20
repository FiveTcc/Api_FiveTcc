import { Inject, Injectable} from "@nestjs/common";
import { Componentes, } from "src/db/schemas";
import { eq, like } from 'drizzle-orm';
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { CreateComponenteDto } from "./dtos/create.componenteDto";
import { UpdateComponenteDto } from "./dtos/updatecomponente";
import { Ambientes } from "src/db/schemas/Ambiente";
import { Componentes_tipo } from "src/db/schemas/componentes_tipo";

@Injectable()
export class ComponenteRepository {
   constructor(
      @Inject(DRIZZLE) private readonly db: DrizzleDB) { }


   // Método para dar select na tabela componente
   async listarComponente() {

      return await this.db
         .select()
         .from(Componentes);
   }

   // Método para dar select na tabela componente por ID
   async listarComponenteId(id: number) {
      const [componente] = await this.db
         .select()
         .from(Componentes)
         .where(eq(Componentes.id_compo, id));
      return componente;
   }

   // Método para cadastrar um componente na tabela componente
   async cadastrarComponente(CreateComponenteDto: CreateComponenteDto) {
      await this.db
         .insert(Componentes)
         .values({
            compo_nome: CreateComponenteDto.compo_nome,
            compo_obs: CreateComponenteDto.compo_obs,
            compo_ativo: CreateComponenteDto.compo_ativo,
            compo_tipo_id: CreateComponenteDto.compo_tipo_id,
            id_amb: CreateComponenteDto.id_amb,
         });
   }

   // Método para atualizar um componente na tabela componente
   async atualizarComponente(id: number, UpdateComponenteDto: UpdateComponenteDto) {

      await this.db
         .update(Componentes)
         .set({
            ...UpdateComponenteDto
         })
         .where(eq(Componentes.id_compo, id))
   }

   // Método para excluir componente
   async excluirComponente(id: number) {

      await this.db
         .delete(Componentes)
         .where(eq(Componentes.id_compo, id));
   }

   // Método para atualizar status do componente
   async atualizarStatusComponente(id: number, status: boolean) {
      await this.db
         .update(Componentes)
         .set({ compo_ativo: status })
         .where(eq(Componentes.id_compo, id));
   }

   async associarCompAmb(id: number, idAmb: number) {

      await this.db
         .update(Componentes)
         .set({
            id_amb: idAmb,
         })
         .where(eq(Componentes.id_compo, id));

   }

   // ##### Filtros de Componentes #####

   // Filtro por ambiente
   async filtrarPorAmbiente(nomeAmb: string) {

      return await this.db
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

   }

   // Filtro por tipo de componente
   async filtrarPorTipo(tipo: string) {

      return await this.db
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

   }

   // Filtro por nome de componente
   async filtrarPorNome(nome: string) {

      return await this.db
         .select()
         .from(Componentes)
         .where(like(Componentes.compo_nome, `%${nome}%`))

   }


}