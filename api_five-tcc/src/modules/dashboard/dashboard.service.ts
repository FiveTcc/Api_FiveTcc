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

  // ---------- Administrador: visão geral do sistema ----------
  private async adminDashboard() {
    const [
      ocorrenciasAbertas,
      ocorrenciasResolvidas,
      ocorrenciasCriticas,
      ocorrenciasTotal,
      ocorrenciasPorStatus,
      atividadesRecentes,
    ] = await Promise.all([
      this.dashboardRepository.countOcorrenciasAbertas(),
      this.dashboardRepository.countOcorrenciasResolvidas(),
      this.dashboardRepository.countOcorrenciasCriticas(),
      this.dashboardRepository.countOcorrenciasTotal(),
      this.dashboardRepository.countOcorrenciasPorStatus(),
      this.dashboardRepository.atividadesRecentes(),
    ]);

    return {
      escopo: 'administrador' as const,
      ocorrenciasAbertas,
      ocorrenciasResolvidas,
      ocorrenciasCriticas,
      ocorrenciasTotal,
      ocorrenciasPorStatus,
      atividadesRecentes,
    };
  }

  // ---------- Técnico: visão focada no próprio trabalho ----------
  private async tecnicoDashboard(tecnicoId: number) {
    const [
      minhasAbertas,
      minhasEncerradas,
      tempoMedioProprio,
      minhasPorPrioridade,
      ultimasAtribuidas,
    ] = await Promise.all([
      this.dashboardRepository.countOcorrenciasAbertasPorTecnico(tecnicoId),
      this.dashboardRepository.countOcorrenciasEncerradasPorTecnico(tecnicoId),
      this.dashboardRepository.getTempoMedioAtendimentoPorTecnico(tecnicoId),
      this.dashboardRepository.getOcorrenciasPorPrioridadePorTecnico(tecnicoId),
      this.dashboardRepository.getUltimasOcorrenciasAtribuidas(tecnicoId),
    ]);

    return {
      escopo: 'tecnico' as const,
      minhasAbertas,
      minhasEncerradas,
      tempoMedioProprio,
      minhasPorPrioridade,
      ultimasAtribuidas,
    };
  }

  // ---------- Funcionário: só as próprias ocorrências ----------
  private async funcionarioDashboard(usuarioId: number) {
    const [minhasOcorrenciasAbertas, statusResumo, ultimasOcorrencias] =
      await Promise.all([
        this.dashboardRepository.countOcorrenciasAbertasPorUsuario(usuarioId),
        this.dashboardRepository.getResumoStatusPorUsuario(usuarioId),
        this.dashboardRepository.getUltimasOcorrenciasPorUsuario(usuarioId),
      ]);

    return {
      escopo: 'funcionario' as const,
      minhasOcorrenciasAbertas,
      statusResumo,
      ultimasOcorrencias,
    };
  }
}