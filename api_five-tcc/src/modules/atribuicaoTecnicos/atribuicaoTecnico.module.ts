import { Module } from "@nestjs/common";
import { AtribuicaoTecnicoController } from "./atribuicaoTecnico.controller";
import { AtribuicaoTecnicoService } from "./atribuicaoTecnico.service";
import { AtribuicaoTecnicoRepository } from "./atribuicaoTecnico.repository";


@Module({
    controllers: [AtribuicaoTecnicoController],
    providers: [AtribuicaoTecnicoService, AtribuicaoTecnicoRepository],
    imports: [],
})
export class AtribuicaoTecnicoModule { }