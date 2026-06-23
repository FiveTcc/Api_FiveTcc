import { Module } from "@nestjs/common";
import { ComponenteController } from "./componente.controller";
import { ComponenteService } from "./componente.service";
import { ComponenteRepository } from "./componente.repository";

@Module({

    controllers: [ComponenteController],
    providers: [ComponenteService, ComponenteRepository],
    exports: [],

})
export class ComponenteModule { }