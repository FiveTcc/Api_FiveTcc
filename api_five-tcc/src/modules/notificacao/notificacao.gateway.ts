import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class NotificacaoGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('entrar_notificacoes')
  entrarNotificacoes(
    @MessageBody() data: { id_user: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const sala = `usuario_${data.id_user}`;

    socket.join(sala);

    console.log(`Usuário ${data.id_user} entrou na sala ${sala}`);

    return {
      sucesso: true,
      sala,
    };
  }

  enviarParaUsuario(idUser: number, notificacao: any) {
    const sala = `usuario_${idUser}`;

    this.server.to(sala).emit('nova_notificacao', notificacao);

    console.log(`Notificação enviada para ${sala}`);
  }
}
