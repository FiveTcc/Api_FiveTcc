import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, } from "@nestjs/common";
import { CreateAmbienteDto } from "./dtos/create.ambienteDto";
import { UpdateAmbienteDto } from "./dtos/update.ambienteDtos";
import { AmbienteRepository } from "./ambiente.repository";

@Injectable()
export class AmbienteService {


    constructor(private readonly AmbienteRepository: AmbienteRepository) { }

    async CadastrarAmbiente(CreateAmbienteDto: CreateAmbienteDto, idUser: number) {
        try {
            await this.verificaNomeAmbiente(CreateAmbienteDto.amb_nome);
            await this.AmbienteRepository.CadastrarAmbiente(CreateAmbienteDto, idUser);

            return { message: 'Ambiente cadastrado com sucesso' };
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao cadastrar ambiente');
        }

    }

    async ListarAmbientes() {
        try {
            return await this.AmbienteRepository.ListarAmbientes();
        } catch (error) {
            throw new InternalServerErrorException('Erro ao listar ambientes');
        }
    }

    async FiltroPorBloco(bloco: string) {
        try {
            const ambientesfiltrados = await this.AmbienteRepository.FiltroPorBloco(bloco);

            if (ambientesfiltrados.length === 0) {
                throw new NotFoundException(
                    'Nenhum ambiente encontrado para o bloco informado',
                );
            }

            return ambientesfiltrados;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao filtrar ambientes por bloco');
        }


    }

    async FiltroTipo(tipoAmb: string) {
        try {
            const ambientesfiltrados = await this.AmbienteRepository.FiltroTipo(tipoAmb);

            if (ambientesfiltrados.length === 0) {
                throw new NotFoundException(
                    'Nenhum ambiente encontrado para o tipo informado',
                );
            }

            return ambientesfiltrados;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException('Erro ao filtrar ambientes por tipo');
        }
    }

    async EditarAmbiente(id: number, UpdateAmbienteDto: UpdateAmbienteDto) {
        try {
            await this.verificaAmbienteExiste(id);

            if (UpdateAmbienteDto.amb_nome) {
                await this.verificaNomeAmbiente(UpdateAmbienteDto.amb_nome, id);
            }

            await this.AmbienteRepository.EditarAmbiente(id, UpdateAmbienteDto);

            return { message: 'Ambiente atualizado com sucesso' };
        } catch (error) {
            if (error instanceof NotFoundException ||
                error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao atualizar ambiente');
        }

    }

    async AtualizarStatusAmbiente(id: number) {
        try {
            const ambiente = await this.verificaAmbienteExiste(id)
            await this.AmbienteRepository.AtualizarStatusAmbiente(id, !ambiente.amb_ativo);

            return { message: 'Status do ambiente atualizado com sucesso', }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao atualizar o status do ambiente',
            );
        }

    }



    // Método para verificar existência e devolve o ambiente
    async verificaAmbienteExiste(id: number) {
        const ambiente = await this.AmbienteRepository.verificaAmbienteExiste(id);

        if (!ambiente) {
            throw new NotFoundException("Ambiente não encontrado");
        }
        return ambiente;
    }

    // Verifica se já existe um tipo de componente com o mesmo nome
    async verificaNomeAmbiente(nAmb: string, idIgnorar?: number) {
        const ambiente = await this.AmbienteRepository.verificaNomeAmbiente(nAmb);

        if (ambiente && ambiente.id_amb !== idIgnorar) {
            throw new ConflictException('Ambiente já cadastrado');
        }
    }
}