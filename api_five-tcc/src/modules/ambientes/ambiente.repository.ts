import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { CreateAmbienteDto } from "./dtos/create.ambienteDto";
import { Ambientes } from "src/db/schemas/Ambiente";


@Injectable()
export class AmbienteRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,) { }

  async CadastrarAmbiente(CriarAmbienteDto: CreateAmbienteDto, idUser: number) {
    try {
      await this.db.insert(Ambientes).values({
        amb_nome: CriarAmbienteDto.amb_nome,
        amb_tipo: CriarAmbienteDto.amb_tipo,
        amb_andar: CriarAmbienteDto.amb_andar,
        amb_bloco: CriarAmbienteDto.amb_bloco,
        amb_obs: CriarAmbienteDto.amb_obs,
        amb_ativo: CriarAmbienteDto.amb_ativo,
        id_user: idUser
      });

    } catch (error) {

    }
  }

  async ListarAmbientes() {
    try {
      return await this.db.select().from(Ambientes);
    } catch (error) {
      console.error("Erro ao listar ambientes:", error);
      throw new Error("Erro ao listar ambientes");
    }
  }

}