import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { AtribuicaoTecnicoRepository } from "./atribuicaoTecnico.repository";
import { AtribuirTecnicoDto } from "./dtos/atribuirTecnicoDtos";
import { UserTipo } from "../common/enums/userTipo.enum";
import { OcorrenciaStatus } from "../ocorrencias/dtos/createocorrenciaDto";
import { OcorrenciaService } from "../ocorrencias/ocorrencia.service";

@Injectable()
export class AtribuicaoTecnicoService {
  constructor(
    private readonly atribuicaoTecnicoRepository: AtribuicaoTecnicoRepository,
    private readonly ocorrenciaService: OcorrenciaService,
  ) {}

  async vincularTecnico(idOcor: number, dto: AtribuirTecnicoDto) {
    try {
      await this.verificaOcorrenciaPodeReceberTecnico(idOcor);
      await this.verificaTecnicoExiste(dto.id_user);
      await this.verificaTecnicoVinculado(idOcor, dto.id_user);

      await this.atribuicaoTecnicoRepository.vincularTecnico(idOcor, dto);

      return { message: 'Técnico vinculado à ocorrência com sucesso' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao vincular técnico à ocorrência');
    }
  }

  async listarTecnicoDaOcorrencia(idOcor: number) {
    try {
      await this.ocorrenciaService.verificaOcorrenciaExiste(idOcor);

      return await this.atribuicaoTecnicoRepository.listarTecnicoDaOcorrencia(idOcor,);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao listar técnicos da ocorrência',);
    }
  }

  async listarOcorrenciaDoTecnico(idUser: number) {
    try {
      return await this.verificaTecnicoExiste(idUser);

      await this.atribuicaoTecnicoRepository.listarOcorrenciaDoTecnico(idUser);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao listar ocorrências do técnico',);
    }
  }

  async desvincularTecnico(idOcorUser: number) {
    try {
      const vinculo =
        await this.atribuicaoTecnicoRepository.verificaVinculoPorId(idOcorUser);

      if (!vinculo) {
        throw new NotFoundException('Vínculo entre técnico e ocorrência não encontrado',);
      }

      await this.verificaOcorrenciaPodeDesvincularTecnico(vinculo.ocorrencia_id,);
      await this.atribuicaoTecnicoRepository.desvincularTecnico(idOcorUser);

      return { message: 'Técnico desvinculado da ocorrência com sucesso' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao desvincular técnico da ocorrência',);
    }
  }

  async listarVinculos() {
    try {
      return await this.atribuicaoTecnicoRepository.listarVinculos();
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar vinculos',);
    }
  }

  // ##### Métodos de validação #####

  // Método de verificar se o técnico existe

  async verificaTecnicoExiste(id: number) {
    const usuario =
      await this.atribuicaoTecnicoRepository.verificaTecnicoExiste(id);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (usuario.user_tipo !== UserTipo.TECNICO) {
      throw new BadRequestException('O usuário informado não é um técnico');
    }
  }

  async verificaTecnicoVinculado(idOcor: number, idUser: number) {
    const vinculo =
      await this.atribuicaoTecnicoRepository.verificaTecnicoVinculado(idOcor,idUser,);

    if (vinculo) {
      throw new BadRequestException('Este técnico já está vinculado à ocorrência',);
    }
  }

  async verificaOcorrenciaPodeReceberTecnico(idOcor: number) {
    const ocorrencia =
      await this.atribuicaoTecnicoRepository.verificaOcorrenciaPodeReceberTecnico(
        idOcor,
      );

    if (!ocorrencia) {
      throw new NotFoundException('Ocorrência não encontrada');
    }
    if (
      ocorrencia.ocor_status !== OcorrenciaStatus.ABERTA &&
      ocorrencia.ocor_status !== OcorrenciaStatus.EM_ANDAMENTO
    ) {
      throw new BadRequestException('A ocorrência não pode receber um técnico neste momento',);
    }
  }

  async verificaOcorrenciaPodeDesvincularTecnico(idOcor: number) {
    const ocorrencia =
      await this.atribuicaoTecnicoRepository.verificaOcorrenciaPodeDesvincularTecnico(idOcor,);

    if (!ocorrencia) {
      throw new NotFoundException('Ocorrência não encontrada');
    }

    if (
      ocorrencia.ocor_status === OcorrenciaStatus.CONCLUIDA ||
      ocorrencia.ocor_status === OcorrenciaStatus.CANCELADA
    ) {
      throw new BadRequestException('Não é possível desvincular um técnico de uma ocorrência concluída ou cancelada',);
    }
  }
}
