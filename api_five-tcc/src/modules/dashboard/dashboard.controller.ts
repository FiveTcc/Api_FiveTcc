import { Controller, Get, Query } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { DashboardFiltroDto } from "./dto/dashboard.filtroDto";

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    // Rota para dashboard completo
    @Get('resumo')
    async resumo(
        @Query() filtro: DashboardFiltroDto,
    ) {
        return this.dashboardService.resumo(filtro);
    }



    // rota para listar ocorrencias
    @Get('/ocorrencias/distribuicao')
    async distribuicao() {
        return await this.dashboardService.distribuicao();
    }

    // Rota para usuários
    @Get('/usuarios')
    async resumoUsuarios() {
        return await this.dashboardService.resumoUsuarios();
    }

    // Rota para ambientes
    @Get('/ambientes')
    async resumoAmbientes() {
        return await this.dashboardService.resumoAmbientes();
    }

    // Rota para componentes
    @Get('/componentes')
    async resumoComponentes() {
        return await this.dashboardService.resumoComponentes();
    }

}