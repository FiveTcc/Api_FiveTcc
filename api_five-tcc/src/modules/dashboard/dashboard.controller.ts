import {
    Controller,
    Get,
    Query,
    Param,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { DashboardFiltroDto } from './dto/dashboard.filtroDto';

@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
    ) {}
    
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

    @Get('tecnico/:id')
    tecnico(
        @Query() filtro: DashboardFiltroDto,
        @Param('id') id: number,
    ) {
        return this.dashboardService.tecnico(
            id,
            filtro,
        );
    }
}