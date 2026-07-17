import { Inject, Injectable, InternalServerErrorException, NotFoundException, } from "@nestjs/common";
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { CreateAmbienteDto } from "./dtos/create.ambienteDto";
import { UpdateAmbienteDto } from "./dtos/update.ambienteDtos";
import { Ambientes } from "src/db/schemas/Ambiente";
import { eq, like } from 'drizzle-orm';


@Injectable()
export class AmbienteRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,) { }

  // metodo para dar select na tabela Ambientes
  async ListarAmbientes() {
    try {

      return await this.db.select().from(Ambientes);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar ambientes');
    }
  }

  // metodo para dar select na tabela Ambientes por id
  async CadastrarAmbiente(CriarAmbienteDto: CreateAmbienteDto, idUser: number) {
    try {

      const ambienteExitente = await this.db
        .select()
        .from(Ambientes)
        .where(eq(Ambientes.amb_nome, CriarAmbienteDto.amb_nome))
        .limit(1);

      if (ambienteExitente.length > 0) {
        throw new InternalServerErrorException('Já existe um ambiente com esse nome');
      }

      await this.db.insert(Ambientes).values({
        amb_nome: CriarAmbienteDto.amb_nome,
        amb_tipo: CriarAmbienteDto.amb_tipo,
        amb_andar: CriarAmbienteDto.amb_andar,
        amb_bloco: CriarAmbienteDto.amb_bloco,
        amb_obs: CriarAmbienteDto.amb_obs,
        amb_ativo: CriarAmbienteDto.amb_ativo,
        id_user: idUser
      });

      return { message: 'Ambiente cadastrado com sucesso' };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao cadastrar ambiente');
    }
  }

  // metodo para dar select na tabela Ambientes por bloco
  async FiltroPorBloco(bloco: string) {
    try {

      const ambientesFiltrados =
        await this.db
          .select()
          .from(Ambientes)
          .where(like(Ambientes.amb_bloco, `%${bloco}%`));

      if (ambientesFiltrados.length === 0) {
        throw new NotFoundException('Nenhum ambiente encontrado para o bloco informado');
      }

      return ambientesFiltrados;

    } catch (error) {

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao filtrar ambientes por bloco');
    }
  }

  // metodo para filtrar ambientes por tipo
  async FiltroTipo(tipoAmb: string) {
    try {

      const ambientesFiltrados =
        await this.db
          .select()
          .from(Ambientes)
          .where(like(Ambientes.amb_tipo, `%${tipoAmb}%`));

      if (ambientesFiltrados.length === 0) {
        throw new NotFoundException('Nenhum ambiente encontrado para o bloco informado');
      }

      return ambientesFiltrados;

    } catch (error) {

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao filtrar ambientes por tipo');
    }
  }

  // metodo para editar ambiente

  async EditarAmbiente(id: number, UpdateAmbienteDto: UpdateAmbienteDto) {

    try {

      // Verifica se o ambiente existe antes de atualizar
      const ambienteExistente = await this.db
        .select()
        .from(Ambientes)
        .where(eq(Ambientes.id_amb, id));

      if (!ambienteExistente) {
        throw new NotFoundException('Ambiente não encontrado');
      }

      await this.db
        .update(Ambientes)
        .set({
          amb_nome: UpdateAmbienteDto.amb_nome,
          amb_tipo: UpdateAmbienteDto.amb_tipo,
          amb_andar: UpdateAmbienteDto.amb_andar,
          amb_bloco: UpdateAmbienteDto.amb_bloco,
          amb_obs: UpdateAmbienteDto.amb_obs,
        })
        .where(eq(Ambientes.id_amb, id));

      return { message: 'Ambiente atualizado com sucesso' };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao editar ambiente');
    }

  }

  // metodo para atualizar o status de um ambiente (inativar/ativar)
  async AtualizarStatusAmbiente(id: number,) {
    try {

      // Verificar se o usuário existe antes de inativar
      const user = await this.db.query.Ambientes.findFirst({
        where: eq(Ambientes.id_amb, id),
      });

      if (!user) {
        throw new NotFoundException('Ambiente não encontrado');
      }

      const novoStatus = !user.id_amb;

      await this.db
        .update(Ambientes)
        .set({ amb_ativo: novoStatus })
        .where(eq(Ambientes.id_amb, id));
      return {
        message: `Usuário ${user.amb_ativo ? 'inativado' : 'ativado'} com sucesso`,
      }

    } catch (error) {
      throw error;
    }
  }

}