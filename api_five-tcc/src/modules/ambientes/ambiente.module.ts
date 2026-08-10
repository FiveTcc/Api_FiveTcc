import { Module } from "@nestjs/common";
import { AmbientesController } from './ambiente.controller'
import { AmbienteService } from './ambiente.service'
import { AmbienteRepository } from './ambiente.repository'

@Module({

    controllers: [AmbientesController],
    providers: [AmbienteService, AmbienteRepository],
    exports: [AmbienteRepository]


})

export class AmbienteModule { }
