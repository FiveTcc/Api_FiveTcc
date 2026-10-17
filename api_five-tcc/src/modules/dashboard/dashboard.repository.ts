import { Injectable, Inject } from '@nestjs/common';
import { eq, ne, and, sql, desc } from 'drizzle-orm';
import { ocorrencias, ocorrencias_user } from 'src/db/schemas';
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";

@Injectable()
export class DashboardRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) { }

  // ===================== Métricas gerais (Admin) =====================

  async countOcorrenciasAbertas() {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(ocorrencias)
      .where(eq(ocorrencias.ocor_status, 'Aberta'));
    return row.total;
  }

  async countOcorrenciasCriticas() {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(ocorrencias)
      .where(
        and( eq(ocorrencias.ocor_prioridade, 'Critica'),
        ne(ocorrencias.ocor_status, 'Concluida'),
        ne(ocorrencias.ocor_status, 'Cancelada'),
       )
      );
    return row.total;
  }

  async countOcorrenciasResolvidas() {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(ocorrencias)
      .where(eq(ocorrencias.ocor_status, 'Concluida'));
    return row.total;
  }

  async countOcorrenciasTotal() {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(ocorrencias);
    return row.total;
  }

  async countOcorrenciasPorStatus() {
    return this.db
      .select({
        status: ocorrencias.ocor_status,
        total: sql<number>`count(*)`,
      })
      .from(ocorrencias)
      .groupBy(ocorrencias.ocor_status);
  }

  async atividadesRecentes(limit = 5) {
    return this.db
      .select({
        nome: ocorrencias.ocor_nome,
        id: ocorrencias.id_ocor,
        status: ocorrencias.ocor_status,
        prioridade: ocorrencias.ocor_prioridade,
        criadoEm: ocorrencias.criado_em,
      })
      .from(ocorrencias)
      .orderBy(desc(ocorrencias.criado_em))
      .limit(limit);
  }

  // ===================== Métricas do técnico =====================

  async countOcorrenciasAbertasPorTecnico(tecnicoId: number) {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(ocorrencias_user)
      .innerJoin(ocorrencias, eq(ocorrencias.id_ocor, ocorrencias_user.ocorrencia_id))
      .where(
        and(
          eq(ocorrencias_user.user_id, tecnicoId),
          eq(ocorrencias.ocor_status, 'Aberta'),
        ),
      );
    return row.total;
  }

  async countOcorrenciasCriticasPorTecnico(tecnicoId: number) {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(ocorrencias_user)
      .innerJoin(ocorrencias, eq(ocorrencias.id_ocor, ocorrencias_user.ocorrencia_id))
      .where(
        and(
          eq(ocorrencias_user.user_id, tecnicoId),
          eq(ocorrencias.ocor_prioridade, 'Critica'),
          ne(ocorrencias.ocor_status, 'Concluida'),
          ne(ocorrencias.ocor_status, 'Cancelada'),
        ),
      );
    return row.total;
  }

  async countOcorrenciasEncerradasPorTecnico(tecnicoId: number) {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(ocorrencias_user)
      .innerJoin(ocorrencias, eq(ocorrencias.id_ocor, ocorrencias_user.ocorrencia_id))
      .where(
        and(
          eq(ocorrencias_user.user_id, tecnicoId),
          eq(ocorrencias.ocor_status, 'Concluida'),
        ),
      );
    return row.total;
  }

  async countOcorrenciasTotaisPorTecnico(tecnicoId: number) {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(ocorrencias_user)
      .innerJoin(ocorrencias, eq(ocorrencias.id_ocor, ocorrencias_user.ocorrencia_id))
      .where(
        and(
          eq(ocorrencias_user.user_id, tecnicoId),
        ),
      );
    return row.total;
  }

  async getTempoMedioAtendimentoPorTecnico(tecnicoId: number) {
    const [row] = await this.db
      .select({
        mediaHoras: sql<number>`avg(timestampdiff(hour, ${ocorrencias.criado_em}, ${ocorrencias.encerrado_em}))`,
      })
      .from(ocorrencias_user)
      .innerJoin(ocorrencias, eq(ocorrencias.id_ocor, ocorrencias_user.ocorrencia_id))
      .where(
        and(
          eq(ocorrencias_user.user_id, tecnicoId),
          eq(ocorrencias.ocor_status, 'Concluida'),
        ),
      );
    return row.mediaHoras ?? 0;
  }

  async getOcorrenciasPorStatusPorTecnico(tecnicoId: number) {
    return this.db
      .select({
        status: ocorrencias.ocor_status,
        total: sql<number>`count(*)`,
      })
      .from(ocorrencias_user)
      .innerJoin(ocorrencias, eq(ocorrencias.id_ocor, ocorrencias_user.ocorrencia_id))
      .where(eq(ocorrencias_user.user_id, tecnicoId))
      .groupBy(ocorrencias.ocor_status);
  }

  async getUltimasOcorrenciasAtribuidas(tecnicoId: number, limit = 5) {
    return this.db
      .select({
        nome: ocorrencias.ocor_nome,
        id: ocorrencias.id_ocor,
        status: ocorrencias.ocor_status,
        prioridade: ocorrencias.ocor_prioridade,
        criadoEm: ocorrencias.criado_em,
      })
      .from(ocorrencias_user)
      .innerJoin(ocorrencias, eq(ocorrencias.id_ocor, ocorrencias_user.ocorrencia_id))
      .where(eq(ocorrencias_user.user_id, tecnicoId))
      .orderBy(desc(ocorrencias.criado_em))
      .limit(limit);
  }

  // ===================== Métricas do funcionario/usuário comum =====================

  async countOcorrenciasAbertasPorUsuario(usuarioId: number) {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(ocorrencias)
      .where(
        and(
          eq(ocorrencias.id_user, usuarioId),
          eq(ocorrencias.ocor_status, 'Aberta'),
        ),
      );
    return row.total;
  }

  async countOcorrenciasEmAndamentoPorUsuario(usuarioId: number) {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(ocorrencias)
      .where(
        and(
          eq(ocorrencias.id_user, usuarioId),
          eq(ocorrencias.ocor_status, 'Em_andamento'),
        ),
      );
    return row.total;
  }

  async countOcorrenciasResolvidasPorUsuario(usuarioId: number) {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(ocorrencias)
      .where(
        and(
          eq(ocorrencias.id_user, usuarioId),
          eq(ocorrencias.ocor_status, 'Concluida'),
        ),
      );
    return row.total;
  }

  async countOcorrenciasTotaisPorUsuario(usuarioId: number) {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)` })
      .from(ocorrencias)
      .where(
        and(
          eq(ocorrencias.id_user, usuarioId),
        ),
      );
    return row.total;
  }

  async getOcorrenciasPorStatusPorUsuario(usuarioId: number) {
    return this.db
      .select({
        status: ocorrencias.ocor_status,
        total: sql<number>`count(*)`,
      })
      .from(ocorrencias)
      .where(eq(ocorrencias.id_user, usuarioId))
      .groupBy(ocorrencias.ocor_status);
  }

  async getUltimasOcorrenciasPorUsuario(usuarioId: number, limit = 5) {
    return this.db
      .select({
        nome: ocorrencias.ocor_nome,
        id: ocorrencias.id_ocor,
        status: ocorrencias.ocor_status,
        prioridade: ocorrencias.ocor_prioridade,
        criadoEm: ocorrencias.criado_em,
      })
      .from(ocorrencias)
      .where(eq(ocorrencias.id_user, usuarioId))
      .orderBy(desc(ocorrencias.criado_em))
      .limit(limit);
  }
}