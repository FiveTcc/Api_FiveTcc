import { Injectable, BadRequestException } from '@nestjs/common';
import { UserTipo } from '../common/enums/userTipo.enum';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async dashboardData(userId: number, tipo: UserTipo) {
    switch (tipo) {
      case UserTipo.ADMINISTRADOR:
        return this.adminDashboard();
      case UserTipo.TECNICO:
        return this.tecnicoDashboard(userId);
      case UserTipo.FUNCIONARIO:
        return this.funcionarioDashboard(userId);
      default:
        throw new BadRequestException('Nível de acesso não suportado');
    }
  }

  // ---------- Administrador ----------
  private async adminDashboard() {
    const [
      ocorrenciasAbertas,
      ocorrenciasCriticas,
      ocorrenciasResolvidas,
      ocorrenciasTotal,
      ocorrenciasPorStatus,
      atividadesRecentes,
    ] = await Promise.all([
      this.dashboardRepository.countOcorrenciasAbertas(),
      this.dashboardRepository.countOcorrenciasCriticas(),
      this.dashboardRepository.countOcorrenciasResolvidas(),
      this.dashboardRepository.countOcorrenciasTotal(),
      this.dashboardRepository.countOcorrenciasPorStatus(),
      this.dashboardRepository.atividadesRecentes(),
    ]);

    return {
      escopo: 'administrador' as const,
      ocorrenciasAbertas,
      ocorrenciasCriticas,
      ocorrenciasResolvidas,
      ocorrenciasTotal,
      ocorrenciasPorStatus,
      atividadesRecentes,
    };
  }

  // ---------- Técnico ----------
  private async tecnicoDashboard(tecnicoId: number) {
    const [
      ocorrenciasAbertas,
      ocorrenciasCriticas,
      ocorrenciasResolvidas,
      ocorrenciasTotal,
      ocorrenciasPorStatus,
      atividadesRecentes,
    ] = await Promise.all([
      this.dashboardRepository.countOcorrenciasAbertasPorTecnico(tecnicoId),
      this.dashboardRepository.countOcorrenciasCriticasPorTecnico(tecnicoId),
      this.dashboardRepository.countOcorrenciasEncerradasPorTecnico(tecnicoId),
      this.dashboardRepository.countOcorrenciasTotaisPorTecnico(tecnicoId),
      this.dashboardRepository.getOcorrenciasPorStatusPorTecnico(tecnicoId),
      this.dashboardRepository.getUltimasOcorrenciasAtribuidas(tecnicoId),
    ]);

    return {
      escopo: 'tecnico' as const,
      ocorrenciasAbertas,
      ocorrenciasCriticas,
      ocorrenciasResolvidas,
      ocorrenciasTotal,
      ocorrenciasPorStatus,
      atividadesRecentes,
    };
  }

  // ---------- Funcionário ----------
  private async funcionarioDashboard(usuarioId: number) {
    const [
      ocorrenciasAbertas,
      ocorrenciasEmAndamento,
      ocorrenciasResolvidas,
      ocorrenciasTotal,
      ocorrenciasPorStatus,
      atividadesRecentes,
    ] = await Promise.all([
      this.dashboardRepository.countOcorrenciasAbertasPorUsuario(usuarioId),
      this.dashboardRepository.countOcorrenciasEmAndamentoPorUsuario(usuarioId),
      this.dashboardRepository.countOcorrenciasResolvidasPorUsuario(usuarioId),
      this.dashboardRepository.countOcorrenciasTotaisPorUsuario(usuarioId),
      this.dashboardRepository.getOcorrenciasPorStatusPorUsuario(usuarioId),
      this.dashboardRepository.getUltimasOcorrenciasPorUsuario(usuarioId),
    ]);

    return {
      escopo: 'funcionario' as const,
      ocorrenciasAbertas,
      ocorrenciasEmAndamento,
      ocorrenciasResolvidas,
      ocorrenciasTotal,
      ocorrenciasPorStatus,
      atividadesRecentes,
    };
  }
}