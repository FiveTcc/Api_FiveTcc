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
        try {
            return await this.db
                .select()
                .from(Componentes_tipo);

        } catch (error) {
            throw new InternalServerErrorException('Erro ao listar tipo de componente')
        }
    }

    // Método para dar select na tabela componentes_tipo por ID
    async listarComponenteTipoId(id: number) {
        try {
            return await this.verificaTipoComponenteExiste(id);

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao listar tipo de componente por ID');
        }
    }

    // Método para dar insert em tipo de componente
    async cadastrarComponenteTipo(createComponenteTipoDto: CreateComponenteTipoDto) {
        try {

            await this.verificaNomeTipo(createComponenteTipoDto.compo_tipo);


            await this.db
                .insert(Componentes_tipo)
                .values({
                    compo_tipo: createComponenteTipoDto.compo_tipo,
                });

            return {
                message: 'Tipo de componente cadastrado com sucesso'
            }
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao cadastrar tipo de componente');
        }
    }


    // Método para dar update em tipo de componente
    async atualizarComponenteTipo(
        id: number,
        updateComponenteTipoDto: UpdateComponenteTipoDto,
    ) {
        try {
            await this.verificaTipoComponenteExiste(id);

            // Verifica se foi informado um novo nome
            if (updateComponenteTipoDto.compo_tipo) {
                await this.verificaNomeTipo(
                    updateComponenteTipoDto.compo_tipo,
                    id,
                );
            }

            await this.db
                .update(Componentes_tipo)
                .set(updateComponenteTipoDto)
                .where(eq(Componentes_tipo.id_compo_tipo, id));

            return {
                message: 'Tipo de componente atualizado com sucesso',
            };

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao atualizar tipo de componente',
            );
        }
    }


    // Método para excluir tipo de componente
    async excluirComponenteTipo(id: number) {
        try {
            await this.verificaTipoComponenteExiste(id);

            await this.db
                .delete(Componentes_tipo)
                .where(eq(Componentes_tipo.id_compo_tipo, id));

            return {
                message: 'Tipo de componente excluído com sucesso'
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao excluir tipo de componente');
        }
    }





    // Método de verificar se o id de tipo de componente existe
    async verificaTipoComponenteExiste(id: number) {

        const [componenteTipo] = await this.db
            .select()
            .from(Componentes_tipo)
            .where(eq(Componentes_tipo.id_compo_tipo, id));


        if (!componenteTipo) {
            throw new NotFoundException(
                'Tipo de componente não encontrado'
            );
        }

        return componenteTipo;
    }


    // Verifica se já existe um tipo de componente com o mesmo nome
    async verificaNomeTipo(
        compoTipo: string,
        idIgnorar?: number,
    ) {
        const [tipo] = await this.db
            .select()
            .from(Componentes_tipo)
            .where(eq(Componentes_tipo.compo_tipo, compoTipo));

        if (tipo && tipo.id_compo_tipo !== idIgnorar) {
            throw new ConflictException(
                'Tipo de componente já cadastrado',
            );
        }

        return tipo;
    }
}