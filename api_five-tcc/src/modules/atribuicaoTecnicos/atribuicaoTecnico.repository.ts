import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { AtribuirTecnicoDto } from "./dtos/atribuirTecnicoDtos";
import { OcorrenciaRepository } from "../ocorrencias/ocorrencia.repository";
import { ocorrencias_user } from "src/db/schemas";
import { eq } from "drizzle-orm";

@Injectable()
export class AtribuicaoTecnicoRepository {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB,
        private readonly ocorrenciaRepository: OcorrenciaRepository
    ) { }

    async vincularTecnico(
        idOcor: number,
        dto: AtribuirTecnicoDto
    ) {

        // Verifica se a ocorrência existe
        await this.ocorrenciaRepository.verificaOcorrenciaExiste(idOcor);

        // Verifica se o tecnico existe
        await this.verificaTecnicoExiste(dto.id_user)

        return {
            message: 'foiii'
        }



    }






    // Método de verificar se o técnico existe
    async verificaTecnicoExiste(id: number) {

        const [tecnico] = await this.db
            .select()
            .from(ocorrencias_user)
            .where(eq(ocorrencias_user.user_id, id));


        if (!tecnico) {
            throw new NotFoundException(
                'Técnico não encontrada'
            );
        }

        return tecnico;
    }


}