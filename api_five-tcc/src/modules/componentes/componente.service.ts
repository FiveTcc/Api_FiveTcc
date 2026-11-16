import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ComponenteRepository } from "./componente.repository";
import { CreateComponenteDto } from "./dtos/create.componenteDto";
import { UpdateComponenteDto } from "./dtos/updatecomponente";

@Injectable()
export class ComponenteService {
  constructor(private readonly componenteRepository: ComponenteRepository) {}

  // Método para listar todos os componentes
  async listarComponente() {
    try {
      return await this.componenteRepository.listarComponente();
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar componentes');
    }
  }

  // Método para listar todos os componentes por id
  async listarComponenteId(id: number) {
    try {
      return await this.verificaComponenteExiste(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro ao listar componente por ID',
      );
    }
  }

  // Método para criar componente
  async cadastrarComponente(CreateComponenteDto: CreateComponenteDto) {
    try {
      await this.componenteRepository.cadastrarComponente(CreateComponenteDto);

      return { message: `Componente cadastrado com sucesso` };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao cadastrar componente');
    }
  }

  // Método para atualizar componente
  async atualizarComponente(
    id: number,
    UpdateComponenteDto: UpdateComponenteDto,
  ) {
    try {
      await this.verificaComponenteExiste(id);
      await this.componenteRepository.atualizarComponente(
        id,
        UpdateComponenteDto,
      );

      return { message: `Componente atualizado com sucesso` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao atualizar componente');
    }
  }

  // Método para excluir componente
  async excluirComponente(id: number) {
    try {
      await this.verificaComponenteExiste(id);
      await this.componenteRepository.excluirComponente(id);

      return { message: `Componente excluído com sucesso` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao excluir componente');
    }
  }

  // Método para atualizar status do componente
  async atualizarStatusComponente(id: number) {
    try {
      const componente = await this.verificaComponenteExiste(id);
      await this.componenteRepository.atualizarStatusComponente(
        id,
        !componente.compo_ativo,
      );

      return { message: `Status do componente atualizado com sucesso` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erro ao atualizar o status do componente',
      );
    }
  }

  // Método para associar componente a um ambiente
  async associarCompAmb(id: number, idAmb: number) {
    try {
      await this.verificaComponenteExiste(id);
      await this.componenteRepository.associarCompAmb(id, idAmb);

      return { message: 'Componente associado ao ambiente com sucesso' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erro ao associar componente ao ambiente',
      );
    }
  }

  // ##### Filtros #####

  // Método para filtrar componentes por ambiente
  async filtrarPorAmbiente(nomeAmb: string) {
    try {
      const componentes =
        await this.componenteRepository.filtrarPorAmbiente(nomeAmb);

      if (componentes.length === 0) {
        throw new NotFoundException(
          'Nenhum componente encontrado para o ambiente informado',
        );
      }

      return componentes;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro ao filtrar componentes por ambiente',
      );
    }
  }

  // Método para filtrar componentes por tipo
  async filtrarPorTipo(tipo: string) {
    try {
      const componentes = await this.componenteRepository.filtrarPorTipo(tipo);

      if (componentes.length === 0) {
        throw new NotFoundException(
          'Nenhum componente encontrado para o tipo informado',
        );
      }

      return componentes;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro ao filtrar componentes por tipo',
      );
    }
  }

  // Método para filtrar componentes por nome
  async filtrarPorNome(nome: string) {
    try {
      const componentes = await this.componenteRepository.filtrarPorNome(nome);

      if (componentes.length === 0) {
        throw new NotFoundException(
          'Nenhum componente encontrado para o nome informado',
        );
      }

      return componentes;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro ao filtrar componente por nome',
      );
    }
  }

  // Método para verificar existência e devolve o componente
  async verificaComponenteExiste(id: number) {
    const componente = await this.componenteRepository.listarComponenteId(id);
    if (!componente) {
      throw new NotFoundException('Componente não encontrado');
    }
    return componente;
  }
}
