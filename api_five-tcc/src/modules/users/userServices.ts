import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/userDto';
import { UpdateUserDto } from './dtos/userUpdateDto';
import { AtualizarPerfilDto } from './dtos/userDtoPefil';
import { UserRepositorio } from './userRepositorio';
import { BcryptService } from '../auth/hashing/bcrypt.services';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UserServices {
  constructor(
    private readonly userRepositorio: UserRepositorio,
    private readonly BcryptService: BcryptService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  // Método para listar todos os usuários
  async ListarUser() {
    try {
      return await this.userRepositorio.ListarUser();
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar usuários');
    }
  }

  // Método para listar um usuário por ID
  async ListarUserId(id: number) {
    try {
      return await this.buscarUsuarioOuFalhar(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Erro ao listar usuário por ID');
    }
  }

  // Método para cadastrar um novo usuário
  async CadastrarUser(CriarUserDto: CreateUserDto) {
    try {
      await this.verificaEmailDisponivel(CriarUserDto.user_email);

      const user_senha = await this.BcryptService.hash(CriarUserDto.user_senha);
      await this.userRepositorio.CadastrarUser({ ...CriarUserDto, user_senha });

      return { message: 'Usuário cadastrado com sucesso' };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      if (error?.cause?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('E-mail já cadastrado');
      }

      throw new InternalServerErrorException('Erro ao cadastrar usuário');
    }
  }

  // Método para atualizar um usuário existente
  async AtualizarUser(id: number, atualizarUserDto: UpdateUserDto) {
    try {
      await this.buscarUsuarioOuFalhar(id);

      // Só os campos que foram enviados
      const dados = Object.fromEntries(
        Object.entries(atualizarUserDto).filter(([, value]) => value !== undefined),
      ) as UpdateUserDto;

      if (Object.keys(dados).length === 0) {
        throw new BadRequestException('Nenhum dado enviado para atualização');
      }

      if (dados.user_email) {
        await this.verificaEmailDisponivel(dados.user_email, id);
      }

      if (dados.user_senha) {
        dados.user_senha = await this.BcryptService.hash(dados.user_senha);
      }

      await this.userRepositorio.AtualizarUser(id, dados);

      return { message: 'Usuário atualizado com sucesso' };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      if (error?.cause?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('E-mail já cadastrado');
      }

      throw new InternalServerErrorException('Erro ao atualizar usuário');
    }
  }

  // Método para inativar um usuário existente
  async AtualizarStatusUser(id: number) {
    try {
      const user = await this.buscarUsuarioOuFalhar(id);
      const novoStatus = !user.user_ativo;

      await this.userRepositorio.AtualizarStatusUser(id, novoStatus);

      return {
        message: `Usuário ${novoStatus ? 'ativado' : 'inativado'} com sucesso`,
      };

    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Erro ao atualizar status do usuário');
    }
  }

  // Método para listar usuários desativados
  async listarStatusUser() {
    try {
      return await this.userRepositorio.listarStatusUser();
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar usuários desativados');
    }
  }

  // Método para visualizar o perfil do usuário logado
  async visualizarPerfilUser(id: number) {
    try {
      const usuario = await this.userRepositorio.visualizarPerfilUser(id);

      if (!usuario) {
        throw new NotFoundException('Usuário não encontrado');
      }

      return usuario;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Erro ao visualizar perfil do usuário');
    }
  }

  // Método para atualizar o perfil do usuário logado
  async atualizarPerfil(id: number, dto: AtualizarPerfilDto) {
    try {
      await this.buscarUsuarioOuFalhar(id);

      if (!dto.user_nome && !dto.user_email && !dto.user_telefone) {
        throw new BadRequestException('Nenhum dado enviado para atualização');
      }

      if (dto.user_email) {
        await this.verificaEmailDisponivel(dto.user_email, id);
      }

      await this.userRepositorio.atualizarPerfil(id, dto);

      return { message: 'Perfil atualizado com sucesso' };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      if (error?.cause?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('E-mail já cadastrado');
      }

      throw new InternalServerErrorException('Erro ao atualizar perfil do usuário');
    }
  }

  async atualizarFotoPerfil(id: number, dto: AtualizarPerfilDto) {
    try {
      await this.userRepositorio.atualizarPerfil(id, dto);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao atualizar foto de perfil do usuário');
    }
  }

  async adicionarFoto(id: number, foto: Express.Multer.File) {
    try {
      if (!foto) {
        throw new BadRequestException('Nenhuma foto foi enviada.');
      }

      await this.buscarUsuarioOuFalhar(id);

      const imagem = await this.cloudinaryService.uploadImagem(
        foto,
        `nos/usuarios/${id}`,
      );

      await this.userRepositorio.atualizarFotoPerfil(
        id,
        imagem.secure_url,
        imagem.public_id,
      );

      return {
        id_user: id,
        user_imagem_url: imagem.secure_url,
        user_imagem_public_id: imagem.public_id,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Erro ao adicionar foto de perfil');
    }
  }

  // ##### Métodos de validação #####

  // Valida existência e devolve o usuário sem a senha (404 se não existir)
  private async buscarUsuarioOuFalhar(id: number) {
    const usuario = await this.userRepositorio.ListarUserId(id);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return usuario;
  }

  // Lança 409 se outro usuário já usa o e-mail
  private async verificaEmailDisponivel(email: string, idIgnorar?: number) {
    const existente = await this.userRepositorio.VerificarEmailExistente(email);

    if (existente && existente.id_user !== idIgnorar) {
      throw new ConflictException('E-mail já cadastrado');
    }
  }
}