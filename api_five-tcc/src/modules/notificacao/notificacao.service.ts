import { Injectable } from "@nestjs/common";
import { NotificacaoRepository } from "./notificacao.repository";

@Injectable()
export class NotificacaoService {
    constructor(private readonly notificacaoRepository: NotificacaoRepository) { }

}