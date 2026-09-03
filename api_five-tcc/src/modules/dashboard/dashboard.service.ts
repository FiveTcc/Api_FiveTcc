import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';

import { DashboardRepository } from './dashboard.repository';
import { DashboardFiltroDto } from './dto/dashboard.filtroDto';

export interface PeriodoDashboard {
    inicio?: Date;
    fim?: Date;
}

@Injectable()
export class DashboardService {
    constructor(
        private readonly dashboardRepository: DashboardRepository,
    ) {}

    async resumo(filtro: DashboardFiltroDto) {
        const periodo = this.validarPeriodo(filtro);

        const [
            usuarios,
            ambientes,
            componentes,
            ocorrencias,
        ] = await Promise.all([
            this.dashboardRepository.resumoUsuarios(),
            this.dashboardRepository.resumoAmbientes(),
            this.dashboardRepository.resumoComponentes(),
            this.dashboardRepository.distribuicaoOcorrencias(periodo),
        ]);

        return {
            usuarios,
            ambientes,
            componentes,
            ocorrencias,
        };
    }

    private validarPeriodo(
        filtro: DashboardFiltroDto,
    ): PeriodoDashboard {
        const inicio = filtro.inicio
            ? new Date(filtro.inicio)
            : undefined;

        const fim = filtro.fim
            ? new Date(filtro.fim)
            : undefined;

        if (inicio && fim && inicio > fim) {
            throw new BadRequestException(
                'A data inicial não pode ser maior que a data final.',
            );
        }

        if (fim) {
            fim.setHours(23, 59, 59, 999);
        }

        return {
            inicio,
            fim,
        };
    }


    async administrador(filtro: DashboardFiltroDto) {
        const periodo = this.validarPeriodo(filtro);

        const [
            usuarios,
            ambientes,
            componentes,
            ocorrencias,
            atividades,
        ] = await Promise.all([
            this.dashboardRepository.resumoUsuarios(),
            this.dashboardRepository.resumoAmbientes(),
            this.dashboardRepository.resumoComponentes(),
            this.dashboardRepository.distribuicaoOcorrencias(periodo),
            this.dashboardRepository.ocorrenciasRecentes(periodo),
        ]);

        return {
            usuarios,
            ambientes,
            componentes,
            ocorrencias,
            atividadesRecentes: atividades,
        };
    }

    async professor(filtro: DashboardFiltroDto) {
        const periodo = this.validarPeriodo(filtro);

        const [
            ocorrencias,
            atividades,
        ] = await Promise.all([
            this.dashboardRepository.distribuicaoOcorrencias(periodo),
            this.dashboardRepository.ocorrenciasRecentes(periodo),
        ]);

        return {
            cards: {
                abertas: ocorrencias.abertas,
                prioridadeMaxima:
                    await this.dashboardRepository
                        .ocorrenciasPrioridadeMaxima(periodo),
                resolvidas: ocorrencias.concluidas,
                total: ocorrencias.total,
            },

            distribuicaoStatus: ocorrencias,

            atividadesRecentes: atividades,
        };
    }

    async tecnico(
        usuarioId: number,
        filtro: DashboardFiltroDto,
    ) {
        const periodo = this.validarPeriodo(filtro);

        // consultas específicas do técnico
    }

}