import { Module } from "@nestjs/common";
import { NotificacaoController } from "./notificacao.controller";
import { NotificacaoService } from "./notificacao.service";
import { NotificacaoRepository } from "./notificacao.repository";


@Module({
    controllers: [NotificacaoController],
    providers: [NotificacaoService, NotificacaoRepository],
    imports: [],
})
export class NotificacaoModule { }