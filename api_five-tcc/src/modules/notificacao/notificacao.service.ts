import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificacaoRepository } from './notificacao.repository';
import { NotificacaoGateway } from './notificacao.gateway';
import { CriarNotificacaoDto } from './dto/criar-notificacao.dto';

@Injectable()
export class NotificacaoService {
  constructor(
    private readonly notificacaoRepository: NotificacaoRepository,
    private readonly gateway: NotificacaoGateway,
  ) {}

  async criar(dto: CriarNotificacaoDto) {
    const noticacao = await this.notificacaoRepository.criar({
      id_user: dto.id_user,
      titulo: dto.titulo,
      mensagem: dto.mensagem,
      tipo: dto.tipo,
      id_ocorrencia: dto.id_ocorrencia,
      lida: false,
    });

    this.gateway.enviarParaUsuario(dto.id_user, noticacao);

    return noticacao;
  }

  async listar(idUser: number) {
    return this.notificacaoRepository.buscarPorUsuario(idUser);
  }

  async listarNaoLidas(idUser: number) {
    return this.notificacaoRepository.buscarNaoLidas(idUser);
  }

  async marcarComoLida(id: number) {
    const notificacao = await this.notificacaoRepository.buscarPorUsuario(id);

    if (!notificacao) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return this.notificacaoRepository.marcarComoLida(id);
  }

  //   async marcarTodasComoLidas(
  //     idUser: number,
  //   ) {
  //     return this.notificacaoRepository.marcarTodasComoLidas(
  //       idUser,
  //     );
  //   }

  //   async excluir(id: number) {
  //     const notificacao =
  //       await this.repository.buscarPorId(id);

  //     if (!notificacao) {
  //       throw new NotFoundException(
  //         "Notificação não encontrada",
  //       );
  //     }

  //     return this.repository.excluir(id);
  //   }
}
