import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "src/db/database/database.constants";
import { Componentes_tipo } from "src/db/schemas";
import type { DrizzleDB } from "src/db/types/drizzleDB";
import { UpdateComponenteTipoDto } from "./dtos/update.componenteTipoDto";
import { CreateComponenteTipoDto } from "./dtos/create.componenteTipoDto";

@Injectable()
export class ComponenteTipoRepository {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB,) { }

    // Método para dar select na tabela componentes_tipo
    async listarComponenteTipo() {

        return await this.db
            .select()
            .from(Componentes_tipo);
    }

    // Método para dar select na tabela componentes_tipo por ID
    async listarComponenteTipoId(id: number) {

        const [tipo] = await this.db
            .select()
            .from(Componentes_tipo)
            .where(eq(Componentes_tipo.id_compo_tipo, id));
        return tipo;
    }

    // Método para cadastrar tipo de componente
    async cadastrarComponenteTipo(createComponenteTipoDto: CreateComponenteTipoDto) {

        await this.db
            .insert(Componentes_tipo)
            .values({
                compo_tipo: createComponenteTipoDto.compo_tipo,
            });
    }


    // Método para dar update em tipo de componente
    async atualizarComponenteTipo(
        id: number,
        updateComponenteTipoDto: UpdateComponenteTipoDto,
    ) {

        await this.db
            .update(Componentes_tipo)
            .set(updateComponenteTipoDto)
            .where(eq(Componentes_tipo.id_compo_tipo, id));
    }


    // Método para excluir tipo de componente
    async excluirComponenteTipo(id: number) {

        await this.db
            .delete(Componentes_tipo)
            .where(eq(Componentes_tipo.id_compo_tipo, id));
    }

    // Verifica se já existe um tipo de componente com o mesmo nome
    async verificaNomeTipo(
        compoTipo: string
    ) {
        const [tipo] = await this.db
            .select()
            .from(Componentes_tipo)
            .where(eq(Componentes_tipo.compo_tipo, compoTipo));
        return tipo;
    }
}