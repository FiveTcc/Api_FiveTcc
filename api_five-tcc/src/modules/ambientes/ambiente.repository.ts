import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { CreateAmbienteDto } from "./dtos/create.ambienteDto";
import { Ambiente } from "src/db/schemas/Ambiente";


@Injectable()
export class AmbienteRepository {
  constructor(
         @Inject(DRIZZLE) private readonly db: DrizzleDB,) { }
 


    async CadastroAmb(dto: CreateAmbienteDto) {

        return await this.db.insert(Ambiente)
        .values(dto)
    }

}