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
    return await this.db
      .select()
      .from(Ambientes);
  }

  // metodo para dar select na tabela Ambientes por id
  async CadastrarAmbiente(CriarAmbienteDto: CreateAmbienteDto, idUser: number) {
    await this.db.insert(Ambientes).values({
      amb_nome: CriarAmbienteDto.amb_nome,
      amb_tipo: CriarAmbienteDto.amb_tipo,
      amb_andar: CriarAmbienteDto.amb_andar,
      amb_bloco: CriarAmbienteDto.amb_bloco,
      amb_obs: CriarAmbienteDto.amb_obs,
      id_user: idUser
    });
  }

  // metodo para dar select na tabela Ambientes por bloco
  async FiltroPorBloco(bloco: string) {
    return await this.db
      .select()
      .from(Ambientes)
      .where(like(Ambientes.amb_bloco, `%${bloco}%`));
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
        throw new NotFoundException('Nenhum ambiente encontrado para o tipo informado');
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
  }

  // metodo para atualizar o status de um ambiente (inativar/ativar)
  async AtualizarStatusAmbiente(id: number, status: boolean) {
    await this.db
      .update(Ambientes)
      .set({ amb_ativo: status })
      .where(eq(Ambientes.id_amb, id));
  }


  // Método de verificar se o ambiente existe
  async verificaAmbienteExiste(id: number) {
    const [ambiente] = await this.db
      .select()
      .from(Ambientes)
      .where(eq(Ambientes.id_amb, id));

      return ambiente;
  }

  // Verifica se já existe um ambiente com o mesmo nome
  async verificaNomeAmbiente(
    nAmb: string
  ) {
    const [ambiente] = await this.db
      .select()
      .from(Ambientes)
      .where(eq(Ambientes.amb_nome, nAmb));

    return ambiente;
  }
}