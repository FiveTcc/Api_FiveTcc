import { Module } from "@nestjs/common";
import { OcorrenciaController } from "./ocorrencia.controller";
import { OcorrenciaService } from "./ocorrencia.service";
import { OcorrenciaRepository } from "./ocorrencia.repository";
import { ComponenteModule } from "../componentes/componente.module";
import { AmbienteModule } from "../ambientes/ambiente.module";


@Module({
    controllers: [OcorrenciaController ],
    providers: [OcorrenciaService, OcorrenciaRepository],
    imports: [ComponenteModule, AmbienteModule],
    exports: [OcorrenciaRepository]
})
export class OcorrenciaModule { }