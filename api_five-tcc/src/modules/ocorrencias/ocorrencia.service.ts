import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { OcorrenciaRepository } from "./ocorrencia.repository";
import { CreateOcorrenciaDto, OcorrenciaStatus, OcorrenciaPrioridade } from "./dtos/createocorrenciaDto";
import { UpdateOcorrenciaDto } from "./dtos/update.ocorrenciaDto";
import { NotificacaoService } from "../notificacao/notificacao.service";
import { TipoNotificacao } from "../notificacao/dto/criar-notificacao.dto";
import { ComponenteService } from "../componentes/componente.service";
import { AmbienteService } from "../ambientes/ambiente.service";
import { CreateObservacaoDto } from "./dtos/create.observacaoDto";

@Injectable()
export class OcorrenciaService {
    constructor(private readonly ocorrenciaRepository: OcorrenciaRepository,
        private readonly notificacaoService: NotificacaoService,
        private readonly componenteService: ComponenteService,
        private readonly ambienteService: AmbienteService
    ) { }

    // Método para listar ocorrência
    async listarOcorrencia() {
        try {
            return await this.ocorrenciaRepository.listarOcorrencia();
        } catch (error) {
            throw new InternalServerErrorException('Erro ao listar ocorrencias');
        }
    }

    // Método para listar ocorrência por id
    async listarOcorrenciaId(id: number) {
        try {
            const ocorrencia = await this.ocorrenciaRepository.listarOcorrenciaPorId(id);

            if (!ocorrencia) {
                throw new NotFoundException('Ocorrência não encontrada');
            }

            return ocorrencia;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao listar ocorrência'
            );
        }
    }

    // Método para criar ocorrência
    async abrirOcorrencia(dto: CreateOcorrenciaDto, idUser: number) {
        try {
            await this.componenteService.verificaComponenteExiste(dto.componente_id);
            await this.ambienteService.verificaAmbienteExiste(dto.ambiente_id);

            const ocorrencia = await this.ocorrenciaRepository.abrirOcorrencia(dto, idUser);

            // await this.notificacaoService.criar({
            //     id_user: idUser,
            //     titulo: "Nova ocorrência",
            //     mensagem: "Uma nova ocorrência foi registrada.",
            //     tipo: TipoNotificacao.NOVA_OCORRENCIA,
            //     id_ocorrencia: ocorrencia.id_ocor,
            // });

            return ocorrencia;
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao abrir ocorrência'
            );
        }

    }

    // Método para editar ocorrência
    async editarOcorrencia(id: number, updateDto: UpdateOcorrenciaDto) {
        try {

            const ocorrencia = await this.verificaOcorrenciaExiste(id);
            await this.validarAlteracao(ocorrencia.ocor_status as OcorrenciaStatus);

            await this.ocorrenciaRepository.editarOcorrencia(id, updateDto);

            return { message: 'Ocorrência editada com sucesso' };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao editar ocorrência');
        }
    }

    // Método para encerrar ocorrência
    async encerrarOcorrencia(id: number) {
        await this.alterarStatus(id, OcorrenciaStatus.CONCLUIDA);
        return { message: 'Ocorrência encerrada com sucesso' };
    }

    // Método para cancelar ocorrência
    async cancelarOcorrencia(id: number) {
        await this.alterarStatus(id, OcorrenciaStatus.CANCELADA);
        return { message: 'Ocorrência cancelada com sucesso' };
    }

    // Método para alterar status da ocorrência
    async alterarStatus(id: number, novoStatus: OcorrenciaStatus) {
        try {
            const ocorrencia = await this.verificaOcorrenciaExiste(id);
            await this.validarTransicao(
                ocorrencia.ocor_status as OcorrenciaStatus,
                novoStatus
            );

            await this.ocorrenciaRepository.alterarStatus(id, novoStatus);

            return { message: 'Status da ocorrência alterado com sucesso' }
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Erro ao alterar status da ocorrência'
            );
        }

    }

    // Método para alterar prioridade da ocorrência
    async alterarPrioridade(id: number, prioridade: OcorrenciaPrioridade) {
        try {
            const ocorrencia = await this.verificaOcorrenciaExiste(id);
            await this.validarAlteracao(ocorrencia.ocor_status as OcorrenciaStatus);

            await this.ocorrenciaRepository.alterarPrioridade(id, prioridade);

            return { message: 'Prioridade alterada com sucesso' };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao alterar prioridade',
            );
        }

    }

    // Método para adicionar observação a ocorrência
    async adicionarObservação(id: number, obs: string) {
        try {
            const ocorrencia = await this.verificaOcorrenciaExiste(id);
            await this.validarAlteracao(ocorrencia.ocor_status as OcorrenciaStatus);

            await this.ocorrenciaRepository.adicionarObservacao(id, obs);
            return { message: 'Observação adicionada com sucesso' };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }


            throw new InternalServerErrorException(
                'Erro ao adicionar observação'
            );
        }

    }

    // Método para associar componente a ocorrência
    async associarComponente(id: number, idComp: number) {
        try {
            const ocorrencia = await this.verificaOcorrenciaExiste(id);
            await this.validarAlteracao(ocorrencia.ocor_status as OcorrenciaStatus);
            // Verifica se o componente existe
            await this.componenteService.verificaComponenteExiste(idComp);

            await this.ocorrenciaRepository.associarComponente(id, idComp);

            return { message: 'Componente associado com sucesso' }
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }


            throw new InternalServerErrorException(
                'Erro ao associar componente a ocorrência',
            );
        }

    }

    // Método para associar ambiente a ocorrência
    async associarAmbiente(id: number, idAmb: number) {
        try {
            const ocorrencia = await this.verificaOcorrenciaExiste(id);
            await this.validarAlteracao(ocorrencia.ocor_status as OcorrenciaStatus);
            // Verifica se ambiente existe
            await this.ambienteService.verificaAmbienteExiste(idAmb);

            await this.ocorrenciaRepository.associarAmbiente(id, idAmb);

            return { message: 'Ambiente associado com sucesso' }
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao associar ambiente a ocorrência',
            );
        }

    }


    // ##### Métodos de validação #####

    // Método de verificar se a ocorrência existe
    async verificaOcorrenciaExiste(id: number) {
        const ocorrencia = await this.ocorrenciaRepository.verificaOcorrenciaExiste(id);

        if (!ocorrencia) {
            throw new NotFoundException(
                'Ocorrência não encontrada'
            );
        }
        return ocorrencia;
    }

    // Método para validar Alteração de status
    async validarAlteracao(status: OcorrenciaStatus) {
        const statusFinais = [
            OcorrenciaStatus.CONCLUIDA,
            OcorrenciaStatus.CANCELADA,
        ];

        if (statusFinais.includes(status)) {
            throw new BadRequestException(
                `Não é possível alterar uma ocorrência com status "${status}"`,
            );
        }
    }

    // Método para validar a transição de status
    async validarTransicao(
        statusAtual: OcorrenciaStatus,
        novoStatus: OcorrenciaStatus
    ) {
        const transicoesPermitidas: Record<
            OcorrenciaStatus,
            OcorrenciaStatus[]
        > = {
            [OcorrenciaStatus.ABERTA]: [
                OcorrenciaStatus.EM_ANDAMENTO,
                OcorrenciaStatus.CANCELADA,
            ],

            [OcorrenciaStatus.EM_ANDAMENTO]: [
                OcorrenciaStatus.CONCLUIDA,
                OcorrenciaStatus.CANCELADA,
            ],

            [OcorrenciaStatus.CONCLUIDA]: [],

            [OcorrenciaStatus.CANCELADA]: [],
        };

        const permitidas =
            transicoesPermitidas[statusAtual];

        if (!permitidas) {
            throw new BadRequestException(
                `Status inválido: "${statusAtual}"`
            );
        }

        if (!permitidas.includes(novoStatus)) {
            throw new BadRequestException(
                `Não é possível alterar a ocorrência de "${statusAtual}" para "${novoStatus}"`
            );
        }
    }

    // ##### Filtros de Ocorrências #####

    // Filtro por nome
    async filtrarPorNome(nomeOcor: string) {
        try {
            return await this.ocorrenciaRepository.filtrarPorNome(nomeOcor);
        } catch (error) {
            throw new InternalServerErrorException(
                'Erro ao filtrar ocorrência por nome',
            );
        }

    }

    // Filtro por ambiente
    async filtrarPorAmbiente(nomeAmb: string) {
        try {
            return await this.ocorrenciaRepository.filtrarPorAmbiente(nomeAmb);
        } catch (error) {

            throw new InternalServerErrorException(
                'Erro ao filtrar ocorrências por ambiente',
            );
        }
    }

    // Filtro por componente
    async filtrarPorComponente(nomeComp: string) {
        try {
            return await this.ocorrenciaRepository.filtrarPorComponente(nomeComp);
        } catch (error) {
            throw new InternalServerErrorException(
                'Erro ao filtrar ocorrências por componente',
            );
        }
    }

    // Filtro por status
    async filtrarPorStatus(status: OcorrenciaStatus) {
        try {
            return await this.ocorrenciaRepository.filtrarPorStatus(status);
        } catch (error) {
            throw new InternalServerErrorException(
                'Erro ao filtrar ocorrências por status',
            );
        }
    }

    // Filtro por status
    async filtrarPorPrioridade(prioridade: OcorrenciaPrioridade) {
        try {
            return await this.ocorrenciaRepository.filtrarPorPrioridade(prioridade);
        } catch (error) {
            throw new InternalServerErrorException(
                'Erro ao filtrar ocorrências por prioridade',
            );
        }
    }

    // Filtro por status
    async filtrarPorPeriodo(dataInicio: string, dataFim: string) {
        try {
            // Valida formato YYYY-MM-DD
            const regexData = /^\d{4}-\d{2}-\d{2}$/;

            if (
                !regexData.test(dataInicio) ||
                !regexData.test(dataFim)
            ) {
                throw new BadRequestException(
                    'Formato de data inválido. Use YYYY-MM-DD'
                );
            }

            if (dataInicio > dataFim) {
                throw new BadRequestException(
                    'A data inicial não pode ser maior que a data final'
                );
            }

            return await this.ocorrenciaRepository.filtrarPorPeriodo(dataInicio, dataFim);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            console.error(error);

            throw new InternalServerErrorException(
                'Erro ao filtrar ocorrências por período'
            );
        }
    }

    async criarObservacao(
        id_ocorrencia: number,
        id_user: number,
        dto: CreateObservacaoDto,
    ) {
        try {
            await this.verificaOcorrenciaExiste(id_ocorrencia);

            const obsTexto = dto.obs_texto?.trim();

            if (!obsTexto) {
                throw new BadRequestException('A observação não pode estar vazia');
            }

            await this.ocorrenciaRepository.criarObservacao(
                id_ocorrencia,
                id_user,
                obsTexto,
            );

            return { message: 'Observação adicionada com sucesso' };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao adicionar observação',
            );
        }
    }

    async listarObservacoes(id_ocorrencia: number) {
        try {
            await this.verificaOcorrenciaExiste(id_ocorrencia);

            return await this.ocorrenciaRepository.listarObservacoes(
                id_ocorrencia,
            );
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao listar observações',
            );
        }
    }
}