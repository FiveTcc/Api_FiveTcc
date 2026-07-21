import { Controller, Get } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller('dashboard')
export class DashboardController {
    constructor( private readonly dashboardService: DashboardService ) {}

    // Rota para dashboard completo
    @Get('/dashboardTotal')
    async dashboardTotal() {
        return await this.dashboardService.dashboardTotal();
    }

    // Rota para usuários
    @Get('/usuarios')
    async dashboardUsuarios() {
        return await this.dashboardService.dashboardUsuarios();
    }

    // Rota para ambientes
    @Get('/ambientes')
    async dashboardAmbientes() {
        return await this.dashboardService.dashboardAmbientes();
    }

    // Rota para componentes
    @Get('/componentes')
    async dashboardComponentes() {
        return await this.dashboardService.dashboardComponentes();
    }

}