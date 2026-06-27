import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { CreateAmbienteDto } from "./dtos/create.ambienteDto";
import { Ambientes } from "src/db/schemas/Ambiente";


@Injectable()
export class AmbienteRepository {
  constructor(
         @Inject(DRIZZLE) private readonly db: DrizzleDB,) { }
 


   

}