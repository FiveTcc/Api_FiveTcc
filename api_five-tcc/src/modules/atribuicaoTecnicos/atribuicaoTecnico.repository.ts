import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { AtribuirTecnicoDto } from "./dtos/atribuirTecnicoDtos";
import { OcorrenciaRepository } from "../ocorrencias/ocorrencia.repository";
import { Ambientes, Componentes, ocorrencias, ocorrencias_user, User } from "src/db/schemas";
import { and, desc, eq } from "drizzle-orm";
import { UserTipo } from "../users/dtos/userDto";
import { OcorrenciaStatus } from "../ocorrencias/dtos/createocorrenciaDto";

@Injectable()
export class AtribuicaoTecnicoRepository {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB,
        private readonly ocorrenciaRepository: OcorrenciaRepository
    ) { }

    async vincularTecnico(
        idOcor: number,
        dto: AtribuirTecnicoDto
    ) {
        try {

            // Verifica se a ocorrência existe e pode receber um técnico

            await this.verificaOcorrenciaPodeReceberTecnico(idOcor)

            // Verifica se o tecnico existe
            await this.verificaTecnicoExiste(dto.id_user)

            // Verifica se o técnico já está vinculado
            await this.verificaTecnicoVinculado(
                idOcor,
                dto.id_user
            );

            await this.db
                .insert(ocorrencias_user)
                .values({
                    ocorrencia_id: idOcor,
                    user_id: dto.id_user,
                    ocor_user_tipo: 1,
                });

            return {
                message: 'Técnico vinculado à ocorrência com sucesso'
            }


        } catch (error) {

            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao vincular técnico à ocorrência'
            );

        }


    }

    async listarTecnicoDaOcorrencia(
        idOcor: number
    ) {
        try {
            // Verifica se a ocorrência existe
            await this.ocorrenciaRepository.verificaOcorrenciaExiste(idOcor);

            return this.db
                .select({
                    id_ocor_user: ocorrencias_user.id_ocor_user,

                    tecnico: {
                        id_user: User.id_user,
                        user_nome: User.user_nome
                    },

                    tipo: ocorrencias_user.ocor_user_tipo,


                    data_atribuicao: ocorrencias_user.data_atribuicao,

                    observacao: ocorrencias_user.ocor_user_obs,
                })
                .from(ocorrencias_user)
                .innerJoin(User,
                    eq(ocorrencias_user.user_id,
                        User.id_user
                    )
                )
                .where(
                    eq(
                        ocorrencias_user.ocorrencia_id,
                        idOcor
                    )
                );

        } catch (error) {

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao listar técnicos da ocorrência'
            );
        }
    }

    async listarOcorrenciaDoTecnico(
        idUser: number
    ) {
        try {

            await this.verificaTecnicoExiste(idUser);

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
                    }

                })
                .from(ocorrencias_user)
                .innerJoin(
                    ocorrencias,
                    eq(
                        ocorrencias_user.ocorrencia_id,
                        ocorrencias.id_ocor
                    )
                )
                .leftJoin(
                    Ambientes,
                    eq(
                        ocorrencias.ambiente_id,
                        Ambientes.id_amb
                    )
                )
                .leftJoin(
                    Componentes,
                    eq(
                        ocorrencias.componente_id,
                        Componentes.id_compo
                    )
                )
                .where(
                    eq(
                        ocorrencias_user.user_id,
                        idUser
                    )
                )
                .orderBy(
                    desc(
                        ocorrencias.criado_em
                    )
                );

        } catch (error) {

            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao listar ocorrências do técnico'
            );
        }
    }





    // ##### Métodos de validação #####



    // Método de verificar se o técnico existe
    async verificaTecnicoExiste(id: number) {

        const [usuario] = await this.db
            .select()
            .from(User)
            .where(
                eq(User.id_user, id)
            );


        if (!usuario) {
            throw new NotFoundException(
                'Usuário não encontrado'
            );
        }

        if (usuario.user_tipo !== UserTipo.TECNICO) {
            throw new BadRequestException(
                'O usuário informado não é um técnico'
            );
        }

        return usuario;
    }

    async verificaTecnicoVinculado(
        idOcor: number,
        idUser: number) {
        const [vinculo] = await this.db
            .select()
            .from(ocorrencias_user)
            .where(and(
                eq(
                    ocorrencias_user.ocorrencia_id,
                    idOcor
                ),
                eq(
                    ocorrencias_user.user_id,
                    idUser
                )
            ));

        if (vinculo) {
            throw new BadRequestException(
                'Este técnico já está vinculado à ocorrência'
            );
        }
    }

    async verificaOcorrenciaPodeReceberTecnico(idOcor: number) {

        const [ocorrencia] = await this.db
            .select({
                id_ocor: ocorrencias.id_ocor,
                ocor_status: ocorrencias.ocor_status,
            })
            .from(ocorrencias)
            .where(eq(ocorrencias.id_ocor, idOcor));

        if (!ocorrencia) {
            throw new NotFoundException('Ocorrência não encontrada');
        }
        if (
            ocorrencia.ocor_status !== OcorrenciaStatus.ABERTA &&
            ocorrencia.ocor_status !== OcorrenciaStatus.EM_ANDAMENTO
        ) {
            throw new BadRequestException(
                'A ocorrência não pode receber um técnico neste momento'
            );
        }



        return ocorrencia;
    }


}