import { Injectable } from '@nestjs/common';

import { DashboardRepository } from './dashboard.repository';
import { DashboardFiltroDto } from './dto/dashboard.filtroDto';

@Injectable()
export class DashboardService {
    constructor(
        private readonly dashboardRepository: DashboardRepository,
    ) { }

    async resumo(filtro: DashboardFiltroDto) {
        const resultado =
            await this.dashboardRepository.resumo(filtro);

        return resultado;
    }

    async distribuicao() {
        const resultado =
            await this.dashboardRepository.distribuicao();

        return {
            ocorrencias: resultado,
        };
    }

    async resumoUsuarios() {
        return this.dashboardRepository.resumoUsuarios();
    }

    async resumoAmbientes() {
        return this.dashboardRepository.resumoAmbientes();
    }

    async resumoComponentes() {
        return this.dashboardRepository.resumoComponentes();
    }
}
