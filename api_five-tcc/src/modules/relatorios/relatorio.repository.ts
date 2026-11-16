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

// Fuso usado para interpretar as datas do filtro (início e fim do dia).
const FUSO = '-03:00';

@Injectable()
export class RelatorioRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  // Aceita YYYY-MM-DD, ISO completo ou Date e devolve YYYY-MM-DD.
  private dia(valor: string | Date): string {
    return valor instanceof Date
      ? valor.toISOString().slice(0, 10)
      : String(valor).slice(0, 10);
  }

  // Monta as condições WHERE comuns a todas as consultas do relatório.
  private montarCondicoes(filtro: FilterRelatorioDto): SQL<unknown>[] {
    const condicoes: SQL<unknown>[] = [];

    if (filtro.data_inicial) {
      condicoes.push(
        gte(
          ocorrencias.criado_em,
          new Date(`${this.dia(filtro.data_inicial)}T00:00:00${FUSO}`),
        ),
      );
    }

    if (filtro.data_final) {
      condicoes.push(
        lte(
          ocorrencias.criado_em,
          new Date(`${this.dia(filtro.data_final)}T23:59:59.999${FUSO}`),
        ),
      );
    }

    if (filtro.status) {
      condicoes.push(eq(ocorrencias.ocor_status, STATUS_MAP[filtro.status]));
    }

    if (filtro.prioridade) {
      condicoes.push(
        eq(ocorrencias.ocor_prioridade, PRIORIDADE_MAP[filtro.prioridade]),
      );
    }

    if (filtro.ambiente) {
      condicoes.push(eq(ocorrencias.ambiente_id, filtro.ambiente));
    }

    if (filtro.tecnico) {
      condicoes.push(sql`EXISTS (
        SELECT 1
        FROM ocorrencias_user ou_filtro
        WHERE ou_filtro.ocorrencia_id = ${ocorrencias.id_ocor}
        AND ou_filtro.user_id = ${filtro.tecnico}
      )`);
    }

    return condicoes;
  }

  // Busca as ocorrências detalhadas para montar as linhas do relatório.
  async buscarOcorrencias(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);

    const tecnicosAgrupados = this.db
      .select({
        ocorrencia_id: ocorrencias_user.ocorrencia_id,
        tecnicos: sql<string>`
          GROUP_CONCAT(
            DISTINCT ${User.user_nome}
            SEPARATOR ', '
          )
        `.as('tecnicos'),
      })
      .from(ocorrencias_user)
      .innerJoin(User, eq(User.id_user, ocorrencias_user.user_id))
      .groupBy(ocorrencias_user.ocorrencia_id)
      .as('tecnicos_agrupados');

    return this.db
      .select({
        id: ocorrencias.id_ocor,
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
      .leftJoin(
        tecnicosAgrupados,
        eq(tecnicosAgrupados.ocorrencia_id, ocorrencias.id_ocor),
      )
      .leftJoin(Ambientes, eq(ocorrencias.ambiente_id, Ambientes.id_amb))
      .leftJoin(
        Componentes,
        eq(ocorrencias.componente_id, Componentes.id_compo),
      )
      .where(condicoes.length ? and(...condicoes) : undefined)
      .orderBy(desc(ocorrencias.criado_em));
  }

  // Contagem de ocorrências por status.
  async contarPorStatus(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);

    return this.db
      .select({
        status: ocorrencias.ocor_status,
        total: sql<number>`count(*)`,
      })
      .from(ocorrencias)
      .where(condicoes.length ? and(...condicoes) : undefined)
      .groupBy(ocorrencias.ocor_status);
  }

  // Contagem de ocorrências por prioridade.
  async contarPorPrioridade(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);

    return this.db
      .select({
        prioridade: ocorrencias.ocor_prioridade,
        total: sql<number>`count(*)`,
      })
      .from(ocorrencias)
      .where(condicoes.length ? and(...condicoes) : undefined)
      .groupBy(ocorrencias.ocor_prioridade);
  }

  // Contagem de ocorrências por ambiente.
  async contarPorAmbiente(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);

    return this.db
      .select({
        ambiente: Ambientes.amb_nome,
        total: sql<number>`count(*)`,
      })
      .from(ocorrencias)
      .leftJoin(Ambientes, eq(ocorrencias.ambiente_id, Ambientes.id_amb))
      .where(condicoes.length ? and(...condicoes) : undefined)
      .groupBy(Ambientes.amb_nome)
      .orderBy(desc(sql`count(*)`));
  }

  // Ranking de componentes.
  async contarPorComponente(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);

    return this.db
      .select({
        componente: sql<string>`
          CONCAT(
            ${Componentes.compo_nome},
            ' (',
            COALESCE(${Ambientes.amb_nome}, '-'),
            ')'
          )
        `,
        total: sql<number>`count(*)`,
      })
      .from(ocorrencias)
      .innerJoin(
        Componentes,
        eq(ocorrencias.componente_id, Componentes.id_compo),
      )
      .leftJoin(Ambientes, eq(ocorrencias.ambiente_id, Ambientes.id_amb))
      .where(condicoes.length ? and(...condicoes) : undefined)
      .groupBy(Componentes.id_compo, Componentes.compo_nome, Ambientes.amb_nome)
      .orderBy(desc(sql`count(*)`));
  }

  // Contagem de ocorrências por técnico.
  // Agrupa pelo ID e pelo nome para evitar juntar técnicos homônimos.
  async contarPorTecnico(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);

    return this.db
      .select({
        id: User.id_user,
        tecnico: User.user_nome,
        total: sql<number>`count(*)`,
      })
      .from(ocorrencias)
      .innerJoin(
        ocorrencias_user,
        eq(ocorrencias_user.ocorrencia_id, ocorrencias.id_ocor),
      )
      .innerJoin(User, eq(User.id_user, ocorrencias_user.user_id))
      .where(condicoes.length ? and(...condicoes) : undefined)
      .groupBy(User.id_user, User.user_nome)
      .orderBy(desc(sql`count(*)`));
  }

  // Contagem de ocorrências por data.
  async contarPorData(filtro: FilterRelatorioDto) {
    const condicoes = this.montarCondicoes(filtro);

    return this.db
      .select({
        data: sql<string>`DATE(${ocorrencias.criado_em})`,
        total: sql<number>`count(*)`,
      })
      .from(ocorrencias)
      .where(condicoes.length ? and(...condicoes) : undefined)
      .groupBy(sql`DATE(${ocorrencias.criado_em})`)
      .orderBy(sql`DATE(${ocorrencias.criado_em})`);
  }

  // Busca o usuário que está gerando o relatório.
  async buscarUsuarioPorId(id: number) {
    const [usuario] = await this.db
      .select({
        user_nome: User.user_nome,
      })
      .from(User)
      .where(eq(User.id_user, id))
      .limit(1);

    return usuario;
  }

  // Converte os IDs dos filtros em nomes legíveis.
  async buscarNomesFiltros(filtro: FilterRelatorioDto) {
    const [ambiente, tecnico] = await Promise.all([
      filtro.ambiente
        ? this.db
            .select({
              nome: Ambientes.amb_nome,
            })
            .from(Ambientes)
            .where(eq(Ambientes.id_amb, filtro.ambiente))
            .limit(1)
        : Promise.resolve([] as { nome: string }[]),

      filtro.tecnico
        ? this.db
            .select({
              nome: User.user_nome,
            })
            .from(User)
            .where(eq(User.id_user, filtro.tecnico))
            .limit(1)
        : Promise.resolve([] as { nome: string }[]),
    ]);

    return {
      ambiente: ambiente[0]?.nome,
      tecnico: tecnico[0]?.nome,
    };
  }

  // Retorna as opções disponíveis para os filtros do frontend.
  async listarOpcoesFiltros() {
    const [ambientes, tecnicos] = await Promise.all([
      this.db
        .select({
          id: Ambientes.id_amb,
          nome: Ambientes.amb_nome,
        })
        .from(Ambientes)
        .orderBy(Ambientes.amb_nome),

      this.db
        .select({
          id: User.id_user,
          nome: User.user_nome,
        })
        .from(User)
        .where(eq(User.user_tipo, 'tecnico'))
        .orderBy(User.user_nome),
    ]);

    return {
      ambientes,
      tecnicos,
    };
  }
}
