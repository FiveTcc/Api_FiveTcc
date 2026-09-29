import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte, lte, sql, SQL } from 'drizzle-orm';
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
      const fim = new Date(filtro.data_final);
      fim.setHours(23, 59, 59, 999);
      condicoes.push(lte(ocorrencias.criado_em, fim));
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
  // Os técnicos vinculados vêm agregados numa string só (via subquery com
  // GROUP_CONCAT), evitando que uma ocorrência com vários técnicos apareça
  // duplicada — uma linha por técnico.
  async buscarOcorrencias(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);

    const tecnicosAgrupados = this.db
      .select({
        ocorrencia_id: ocorrencias_user.ocorrencia_id,
        tecnicos: sql<string>`GROUP_CONCAT(DISTINCT ${User.user_nome} SEPARATOR ', ')`.as(
          'tecnicos',
        ),
      })
      .from(ocorrencias_user)
      .innerJoin(User, eq(User.id_user, ocorrencias_user.user_id))
      .groupBy(ocorrencias_user.ocorrencia_id)
      .as('tecnicos_agrupados');

    const query = this.db
      .select({
        nome: ocorrencias.ocor_nome,
        criado_por: User.user_nome,
        tecnico_responsavel: tecnicosAgrupados.tecnicos,
        status: ocorrencias.ocor_status,
        prioridade: ocorrencias.ocor_prioridade,
        criado_em: ocorrencias.criado_em,
        encerrado_em: ocorrencias.encerrado_em,
        ambiente: Ambientes.amb_nome,
        componente: Componentes.compo_nome,
      })
      .from(ocorrencias)
      .leftJoin(User, eq(ocorrencias.id_user, User.id_user))
      .leftJoin(tecnicosAgrupados, eq(tecnicosAgrupados.ocorrencia_id, ocorrencias.id_ocor))
      .leftJoin(Ambientes, eq(ocorrencias.ambiente_id, Ambientes.id_amb))
      .leftJoin(Componentes, eq(ocorrencias.componente_id, Componentes.id_compo))
      .orderBy(desc(ocorrencias.criado_em));

    if (filtro.tecnico) {
      // Filtro por técnico específico: checa existência via EXISTS,
      // sem juntar ocorrencias_user de novo (evita duplicar linhas).
      return query.where(
        and(
          ...condicoes,
          sql`EXISTS (
            SELECT 1 FROM ocorrencias_user
            WHERE ocorrencias_user.ocorrencia_id = ocorrencias.id_ocorrencia
            AND ocorrencias_user.user_id = ${filtro.tecnico}
          )`,
        ),
      );
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