import { ConflictException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ComponenteTipoRepository } from "./componenteTipo.repository";
import { CreateComponenteTipoDto } from "./dtos/create.componenteTipoDto";
import { UpdateComponenteTipoDto } from "./dtos/update.componenteTipoDto";

@Injectable()
export class ComponenteTipoService {
    constructor(private readonly componenteTipoRepository: ComponenteTipoRepository) { }

    // Método para listar todos os tipos de componentes
    async listarComponenteTipo() {
        try {
            return await this.componenteTipoRepository.listarComponenteTipo();
        } catch (error) {
            throw new InternalServerErrorException('Erro ao listar tipo de componente')
        }

    }

    // Método para listar tipo de componente por ID
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

    // Método para cadastrar tipo de componente
    async cadastrarComponenteTipo(CreateComponenteTipoDto: CreateComponenteTipoDto) {
        try {

            await this.verificaNomeTipo(CreateComponenteTipoDto.compo_tipo);
            await this.componenteTipoRepository.cadastrarComponenteTipo(CreateComponenteTipoDto);

            return { message: 'Tipo de componente cadastrado com sucesso' }
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao cadastrar tipo de componente');
        }

    }

    // Método para atualizar tipo de componente
    async atualizarComponenteTipo(id: number, UpdateComponenteTipoDto: UpdateComponenteTipoDto) {
        try {
            await this.verificaTipoComponenteExiste(id);

            if (UpdateComponenteTipoDto.compo_tipo) {
                await this.verificaNomeTipo(UpdateComponenteTipoDto.compo_tipo, id);
            }

            await this.componenteTipoRepository.atualizarComponenteTipo(id, UpdateComponenteTipoDto);

            return { message: 'Tipo de componente atualizado com sucesso' };
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
            await this.componenteTipoRepository.excluirComponenteTipo(id);

            return { message: 'Tipo de componente excluído com sucesso' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao excluir tipo de componente');
        }
    }

    // Verifica a existencia do tipo por id
    async verificaTipoComponenteExiste(id: number) {
        const tipo = await this.componenteTipoRepository.listarComponenteTipoId(id);
        if (!tipo) {
            throw new NotFoundException('Tipo de componente não encontrado');
        }
        return tipo;
    }

    // Verifica se já existe um tipo de componente com o mesmo nome
    async verificaNomeTipo(compoTipo: string, idIgnorar?: number) {
        const tipo = await this.componenteTipoRepository.verificaNomeTipo(compoTipo);

        if (tipo && tipo.id_compo_tipo !== idIgnorar) {
            throw new ConflictException('Tipo de componente já cadastrado');
        }
    }
}