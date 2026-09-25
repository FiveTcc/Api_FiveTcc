import { Module } from "@nestjs/common";
import { NotificacaoService } from "./notificacao.service";
import { NotificacaoRepository } from "./notificacao.repository";
import { NotificacaoGateway } from "./notificacao.gateway";


@Module({
    controllers: [],
    providers: [
        NotificacaoService, 
        NotificacaoRepository , 
        NotificacaoGateway],
   exports: [
    
    NotificacaoService, 
    NotificacaoGateway,
  ],
})
export class NotificacaoModule { }