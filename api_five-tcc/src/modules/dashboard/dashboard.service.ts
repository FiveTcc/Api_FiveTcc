import { Injectable, BadRequestException } from '@nestjs/common';
import { UserTipo } from '../common/enums/userTipo.enum'; 
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getDashboardData(userId: number, tipo: UserTipo) {
    switch (tipo) {
      case UserTipo.ADMINISTRADOR:
        return this.getAdminDashboard();
      case UserTipo.TECNICO:
        return this.getTecnicoDashboard(userId);
      case UserTipo.PROFESSOR:
        return this.getProfessorDashboard(userId);
      default:
        throw new BadRequestException('Nível de acesso não suportado');
    }
  }

  // ---------- Administrador: visão geral do sistema ----------
  private async getAdminDashboard() {
    const [
      ocorrenciasAbertas,
      ocorrenciasEncerradas,
      tempoMedioAtendimento,
      ocorrenciasPorPrioridade,
      topTecnicos,
      ambientesComMaisProblemas,
      componentesComMaisFalhas,
    ] = await Promise.all([
      this.dashboardRepository.countOcorrenciasAbertas(),
      this.dashboardRepository.countOcorrenciasEncerradas(),
      this.dashboardRepository.getTempoMedioAtendimento(),
      this.dashboardRepository.getOcorrenciasPorPrioridade(),
      this.dashboardRepository.getTopTecnicos(),
      this.dashboardRepository.getAmbientesComMaisProblemas(),
      this.dashboardRepository.getComponentesComMaisFalhas(),
    ]);

    return {
      escopo: 'administrador' as const,
      ocorrenciasAbertas,
      ocorrenciasEncerradas,
      tempoMedioAtendimento,
      ocorrenciasPorPrioridade,
      topTecnicos,
      ambientesComMaisProblemas,
      componentesComMaisFalhas,
    };
  }

  // ---------- Técnico: visão focada no próprio trabalho ----------
  private async getTecnicoDashboard(tecnicoId: number) {
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

  // ---------- Professor / usuário comum: só as próprias ocorrências ----------
  private async getProfessorDashboard(usuarioId: number) {
    const [minhasOcorrenciasAbertas, statusResumo, ultimasOcorrencias] =
      await Promise.all([
        this.dashboardRepository.countOcorrenciasAbertasPorUsuario(usuarioId),
        this.dashboardRepository.getResumoStatusPorUsuario(usuarioId),
        this.dashboardRepository.getUltimasOcorrenciasPorUsuario(usuarioId),
      ]);

    return {
      escopo: 'professor' as const,
      minhasOcorrenciasAbertas,
      statusResumo,
      ultimasOcorrencias,
    };
  }
}