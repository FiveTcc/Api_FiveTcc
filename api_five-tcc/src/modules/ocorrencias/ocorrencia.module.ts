import { Module } from "@nestjs/common";
import { OcorrenciaController } from "./ocorrencia.controller";
import { OcorrenciaService } from "./ocorrencia.service";
import { OcorrenciaRepository } from "./ocorrencia.repository";


@Module({
    controllers: [OcorrenciaController ],
    providers: [OcorrenciaService, OcorrenciaRepository],
    imports: [],
})
export class OcorrenciaModule { }