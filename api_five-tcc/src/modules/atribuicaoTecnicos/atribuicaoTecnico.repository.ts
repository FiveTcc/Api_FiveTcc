import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { AtribuirTecnicoDto, TipoAtuacao } from "./dtos/atribuirTecnicoDtos";
import { Ambientes, Componentes, ocorrencias, ocorrencias_user, User } from "src/db/schemas";
import { and, desc, eq } from "drizzle-orm";

@Injectable()
export class AtribuicaoTecnicoRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async vincularTecnico(idOcor: number, dto: AtribuirTecnicoDto) {
    await this.db.insert(ocorrencias_user).values({
      ocorrencia_id: idOcor,
      user_id: dto.id_user,
      ocor_user_tipo: dto.tipo_atuacao ?? TipoAtuacao.RESPONSAVEL,
      ocor_user_obs: dto.observacoes,
    });
  }

  async listarTecnicoDaOcorrencia(idOcor: number) {
    return this.db
      .select({
        id_ocor_user: ocorrencias_user.id_ocor_user,
        tecnico: {
          id_user: User.id_user,
          user_nome: User.user_nome,
        },
        tipo: ocorrencias_user.ocor_user_tipo,
        data_atribuicao: ocorrencias_user.data_atribuicao,
        observacao: ocorrencias_user.ocor_user_obs,
      })
      .from(ocorrencias_user)
      .innerJoin(User, eq(ocorrencias_user.user_id, User.id_user))
      .where(eq(ocorrencias_user.ocorrencia_id, idOcor));
  }

  async listarOcorrenciaDoTecnico(idUser: number) {
    return this.db
      .select({
        ocorrencia: {
          id_ocor: ocorrencias.id_ocor,
          ocor_nome: ocorrencias.ocor_nome,
          ocor_status: ocorrencias.ocor_status,
          ocor_prioridade: ocorrencias.ocor_prioridade,
          ocor_obs: ocorrencias.ocor_obs,
          criado_em: ocorrencias.criado_em,
        },
        atribuicao: {
          id_ocor_user: ocorrencias_user.id_ocor_user,
          tipo: ocorrencias_user.ocor_user_tipo,
          data_atribuicao: ocorrencias_user.data_atribuicao,
        },
        ambiente: {
          id_amb: Ambientes.id_amb,
          amb_nome: Ambientes.amb_nome,
        },
        componente: {
          id_compo: Componentes.id_compo,

          compo_nome: Componentes.compo_nome,
        },
      })
      .from(ocorrencias_user)
      .innerJoin(
        ocorrencias,
        eq(ocorrencias_user.ocorrencia_id, ocorrencias.id_ocor),
      )
      .leftJoin(Ambientes, eq(ocorrencias.ambiente_id, Ambientes.id_amb))
      .leftJoin(
        Componentes,
        eq(ocorrencias.componente_id, Componentes.id_compo),
      )
      .where(eq(ocorrencias_user.user_id, idUser))
      .orderBy(desc(ocorrencias.criado_em));
  }

  async desvincularTecnico(idOcorUser: number) {
    await this.db
      .delete(ocorrencias_user)
      .where(eq(ocorrencias_user.id_ocor_user, idOcorUser));
  }

  async listarVinculos() {
    return this.db
      .select({
        vinculo: ocorrencias_user.id_ocor_user,
        ocorrencia: ocorrencias.id_ocor,
        tecnico: User.user_nome,
      })
      .from(ocorrencias_user)
      .innerJoin(
        ocorrencias,
        eq(ocorrencias_user.ocorrencia_id, ocorrencias.id_ocor),
      )
      .innerJoin(User, eq(ocorrencias_user.user_id, User.id_user));
  }

  // ##### Métodos de validação #####

  // Método de verificar se o técnico existe
  async verificaTecnicoExiste(id: number) {
    const [usuario] = await this.db
      .select()
      .from(User)
      .where(eq(User.id_user, id));

    return usuario;
  }

  async verificaVinculoPorId(idOcorUser: number) {
    const [vinculo] = await this.db
      .select({
        id_ocor_user: ocorrencias_user.id_ocor_user,
        ocorrencia_id: ocorrencias_user.ocorrencia_id,
        user_id: ocorrencias_user.user_id,
      })
      .from(ocorrencias_user)
      .where(eq(ocorrencias_user.id_ocor_user, idOcorUser));
    return vinculo;
  }

  async verificaTecnicoVinculado(idOcor: number, idUser: number) {
    const [vinculo] = await this.db
      .select()
      .from(ocorrencias_user)
      .where(
        and(
          eq(ocorrencias_user.ocorrencia_id, idOcor),
          eq(ocorrencias_user.user_id, idUser),
        ),
      );

    return vinculo;
  }

  async verificaOcorrenciaPodeReceberTecnico(idOcor: number) {
    const [ocorrencia] = await this.db
      .select({
        id_ocor: ocorrencias.id_ocor,
        ocor_status: ocorrencias.ocor_status,
      })
      .from(ocorrencias)
      .where(eq(ocorrencias.id_ocor, idOcor));

    return ocorrencia;
  }

  async verificaOcorrenciaPodeDesvincularTecnico(idOcor: number) {
    const [ocorrencia] = await this.db
      .select({
        id_ocor: ocorrencias.id_ocor,
        ocor_status: ocorrencias.ocor_status,
      })
      .from(ocorrencias)
      .where(eq(ocorrencias.id_ocor, idOcor));

    return ocorrencia;
  }
}
