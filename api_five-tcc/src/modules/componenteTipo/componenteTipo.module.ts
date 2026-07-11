import { Module } from "@nestjs/common";
import { ComponenteTipoController } from "./componenteTipo.controller";
import { ComponenteTipoService} from "./componenteTipo.service";
import { ComponenteTipoRepository} from "./componenteTipo.repository";

@Module({

    controllers: [ComponenteTipoController],
    providers: [ComponenteTipoService, ComponenteTipoRepository],
    exports: [ ComponenteTipoRepository],

})
export class ComponenteTipoModule { }