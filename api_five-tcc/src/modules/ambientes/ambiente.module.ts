import { Module } from "@nestjs/common";
import {AmbientesController} from './ambiente.controller'
import {AmbienteService} from './ambiente.service'

@Module({

    controllers:[AmbientesController],
    providers: [ AmbienteService],
    exports: [],


})

export class AmbienteModule{}
