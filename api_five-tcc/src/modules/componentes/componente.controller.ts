import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ComponenteService } from "./componente.service";
import { CreateComponenteDto } from "./dtos/create.componenteDto";

@Controller('componentes')
export class ComponenteController {
    constructor(private readonly componenteService: ComponenteService) { }

    // Rota para listar componentes
    @Get('/listarComponente')
    async listarComponente() {
        return await this.componenteService.ListarComponente();
    }

    // Rota para listar componentes por id
    @Get('/listarComponenteId/:id')
    async listarComponentePorId(@Param('id', ParseIntPipe) id: number) {
        return await this.componenteService.ListarComponenteId(id);
    }

    // Rota para cadastrar componente 
    @Post('/cadastrarComponente')
    async cadastrarComponente(@Body() CreateComponenteDto: CreateComponenteDto) {
        return await this.componenteService.CadastrarComponente(CreateComponenteDto);
    }

}