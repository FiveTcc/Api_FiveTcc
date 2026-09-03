import {
    Controller,
    Get,
    Query,
    Req,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { DashboardFiltroDto } from './dto/dashboard.filtroDto';

@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
    ) {}

    @Get('resumo')
    async resumo(
        @Query() filtro: DashboardFiltroDto,
    ) {
        return this.dashboardService.resumo(filtro);
    }


    @Get('administrador')
    administrador(
        @Query() filtro: DashboardFiltroDto,
    ) {
        return this.dashboardService.administrador(filtro);
    }

    @Get('professor')
    professor(
        @Query() filtro: DashboardFiltroDto,
    ) {
        return this.dashboardService.professor(filtro);
    }

    @Get('tecnico')
    tecnico(
        @Query() filtro: DashboardFiltroDto,
        @Req() req,
    ) {
        return this.dashboardService.tecnico(
            req.user.id,
            filtro,
        );
    }
}