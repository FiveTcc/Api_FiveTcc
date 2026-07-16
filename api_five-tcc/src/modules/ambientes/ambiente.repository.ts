import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { CreateAmbienteDto } from "./dtos/create.ambienteDto";
import { Ambientes } from "src/db/schemas/Ambiente";
import { eq } from 'drizzle-orm';


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
  async FiltroPorBloco (bloco: string) {
    try{

      return await this.db
      .select()
      .from(Ambientes)
      .where(eq(Ambientes.amb_bloco, bloco));

    }catch (error) {
      throw new InternalServerErrorException('Erro ao filtrar ambientes por bloco');
    }
  }

  // metodo para filtrar ambientes por tipo
  async FiltroTipo ( tipoAmb: string) {
    try{

      return await this.db
      .select()
      .from(Ambientes)
      .where(eq(Ambientes.amb_tipo, tipoAmb));

    }catch (error) {
      throw new InternalServerErrorException('Erro ao filtrar ambientes por tipo');
    }
  }

  


  
}