import { Inject, Injectable, InternalServerErrorException, } from '@nestjs/common';
import { DRIZZLE } from 'src/db/database/database.constants';
import type { DrizzleDB } from 'src/db/types/drizzleDB';
import { notificacoes } from 'src/db/schemas';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class NotificacaoRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  // funçao para criar notificaçao

  async criar(data: typeof notificacoes.$inferInsert) {
    try {
      const resultado = await this.db.insert(notificacoes).values(data);

      const id = resultado[0].insertId;

      const [notificacao] = await this.db
        .select()
        .from(notificacoes)
        .where(eq(notificacoes.id_notificacao, Number(id)));

      return notificacao;
    } catch (erro) {
      throw new InternalServerErrorException('Erro ao enviar dados!');
    }
  }

  // funçao para buscar notificaçao por usuario

  async buscarPorUsuario(idUser: number) {
    try {
      return this.db
        .select()
        .from(notificacoes)
        .where(eq(notificacoes.id_user, idUser))
        .orderBy(desc(notificacoes.criado_em));
    } catch (erro) {
      throw new InternalServerErrorException('Erro ao buscar Notificaçao');
    }
  }

  // funçao para buscar notificaçoes não lidas

  async buscarNaoLidas(idUser: number) {
    try {
      return this.db
        .select()
        .from(notificacoes)
        .where(eq(notificacoes.id_user, idUser));
    } catch (erro) {
      throw new InternalServerErrorException(
        'Erro ao busacar Notificaçoes nao lidas!',
      );
    }
  }

  // funçao para marcar como lida a notificaçao

  async marcarComoLida(id: number) {
    try {
      await this.db
        .update(notificacoes)
        .set({
          lida: true,
        })
        .where(eq(notificacoes.id_notificacao, id));

      return true;
    } catch (erro) {
      throw new InternalServerErrorException('erro ao marcar como lida');
    }
  }
}
