import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gte, lte, sql, SQL } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/database/database.constants';
import type { DrizzleDB } from 'src/db/types/drizzleDB';
import {
  ocorrencias,
  ocorrencias_user,
  Ambientes,
  Componentes,
  User,
} from 'src/db/schemas';
import { FilterRelatorioDto } from './dtos/filter.relatorioDto';
import { STATUS_MAP, PRIORIDADE_MAP } from './relatorio.constants';

@Injectable()
export class RelatorioRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  // Monta as condições WHERE comuns a partir do filtro (sem o técnico,
  // que exige join à parte e é tratado em buscarOcorrencias).
  private montarCondicoes(filtro: FilterRelatorioDto): SQL<unknown>[] {
    const condicoes: SQL<unknown>[] = [];

    if (filtro.data_inicial) {
      condicoes.push(gte(ocorrencias.criado_em, new Date(filtro.data_inicial)));
    }
    if (filtro.data_final) {
      condicoes.push(lte(ocorrencias.criado_em, new Date(filtro.data_final)));
    }
    if (filtro.status) {
      condicoes.push(eq(ocorrencias.ocor_status, STATUS_MAP[filtro.status]));
    }
    if (filtro.prioridade) {
      condicoes.push(eq(ocorrencias.ocor_prioridade, PRIORIDADE_MAP[filtro.prioridade]));
    }
    if (filtro.ambiente) {
      condicoes.push(eq(ocorrencias.ambiente_id, filtro.ambiente));
    }

    return condicoes;
  }

  // Busca as ocorrências detalhadas para montar as linhas do relatório.
  async buscarOcorrencias(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);

    const query = this.db
      .select({
        id: ocorrencias.id_ocor,
        status: ocorrencias.ocor_status,
        prioridade: ocorrencias.ocor_prioridade,
        criado_em: ocorrencias.criado_em,
        encerrado_em: ocorrencias.encerrado_em,
        ambiente: Ambientes.amb_nome,
        componente: Componentes.compo_nome,
      })
      .from(ocorrencias)
      .leftJoin(Ambientes, eq(ocorrencias.ambiente_id, Ambientes.id_amb))
      .leftJoin(Componentes, eq(ocorrencias.componente_id, Componentes.id_compo));

    if (filtro.tecnico) {
      return query
        .innerJoin(ocorrencias_user, eq(ocorrencias_user.ocorrencia_id, ocorrencias.id_ocor))
        .where(and(...condicoes, eq(ocorrencias_user.user_id, filtro.tecnico)));
    }

    return condicoes.length ? query.where(and(...condicoes)) : query;
  }

  async contarPorStatus(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);
    return this.db
      .select({ status: ocorrencias.ocor_status, total: sql<number>`count(*)` })
      .from(ocorrencias)
      .where(condicoes.length ? and(...condicoes) : undefined)
      .groupBy(ocorrencias.ocor_status);
  }

  async contarPorPrioridade(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);
    return this.db
      .select({ prioridade: ocorrencias.ocor_prioridade, total: sql<number>`count(*)` })
      .from(ocorrencias)
      .where(condicoes.length ? and(...condicoes) : undefined)
      .groupBy(ocorrencias.ocor_prioridade);
  }

  async contarPorAmbiente(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);
    return this.db
      .select({ ambiente: Ambientes.amb_nome, total: sql<number>`count(*)` })
      .from(ocorrencias)
      .leftJoin(Ambientes, eq(ocorrencias.ambiente_id, Ambientes.id_amb))
      .where(condicoes.length ? and(...condicoes) : undefined)
      .groupBy(Ambientes.amb_nome);
  }

  async contarPorTecnico(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);
    return this.db
      .select({ tecnico: User.user_nome, total: sql<number>`count(*)` })
      .from(ocorrencias)
      .innerJoin(ocorrencias_user, eq(ocorrencias_user.ocorrencia_id, ocorrencias.id_ocor))
      .innerJoin(User, eq(User.id_user, ocorrencias_user.user_id))
      .where(condicoes.length ? and(...condicoes) : undefined)
      .groupBy(User.user_nome);
  }

  async contarPorData(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);
    return this.db
      .select({
        data: sql<string>`DATE(${ocorrencias.criado_em})`,
        total: sql<number>`count(*)`,
      })
      .from(ocorrencias)
      .where(condicoes.length ? and(...condicoes) : undefined)
      .groupBy(sql`DATE(${ocorrencias.criado_em})`);
  }
}