import { Module } from "@nestjs/common";
import { ComponenteController } from "./componente.controller";
import { ComponenteService } from "./componente.service";
import { ComponenteRepository } from "./componente.repository";
import { ComponenteTipoModule } from "../componenteTipo/componenteTipo.module";
import { AmbienteModule } from "../ambientes/ambiente.module";

@Module({

    controllers: [ComponenteController],
    providers: [ComponenteService, ComponenteRepository],
    imports: [ComponenteTipoModule, AmbienteModule],
    exports: [ComponenteService],

})
export class ComponenteModule { }