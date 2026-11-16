import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './auth.dto/login.dto';
import { LogonRefreshTokenDto } from './auth.dto/logon.dto';
import { UserRepositorio } from '../users/userRepositorio';
import type { ConfigType } from '@nestjs/config';
import { HashingService } from './hashing/hashing.service';
import jwtConfig from './config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../email/mail.sevice';

@Injectable()
export class AuthServices {
  constructor(
    private readonly userRepositorio: UserRepositorio,
    private readonly HashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtSevices: JwtService,
    private readonly mailService: MailService,
  ) {}

  async Login(loginDto: LoginDto) {
    const user = await this.userRepositorio.VerificarEmailExistente(
      loginDto.user_email,
    );

    if (!user) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const passwordisValid = await this.HashingService.compare(
      loginDto.user_senha,
      user.user_senha,
    );

    if (!passwordisValid) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    if (!user.user_ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    return await this.gerarTokens(user);
  }

  private async signJwtAsync<T>(sub: number, expiresIn: number, payload?: T) {
    return await this.jwtSevices.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn,
      },
    );
  }

  async refreshTokens(logonRefreshTokenDto: LogonRefreshTokenDto) {
    let payload: any;

    try {
      payload = await this.jwtSevices.verifyAsync(
        logonRefreshTokenDto.refreshToken,
        {
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        },
      );
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    // Impede usar um access token no lugar do refresh token
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.userRepositorio.ListarUserId(payload.sub);

    if (!user || !user.user_ativo) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    return await this.gerarTokens(user);
  }

  // Recuperar senha
  async solocitarRecuperacaoSenha(email: string) {
    const user = await this.userRepositorio.VerificarEmailExistente(email);

    if (!user || !user.user_ativo) {
      return {
        message:
          'Se o e-mail estiver cadastrado, você receberá um link de recuperação',
      };
    }

    // Gerar token de redefinição de senha
    const token = await this.jwtSevices.signAsync(
      {
        sub: user.id_user,
        email: user.user_email,
        type: 'password_reset',
      },
      {
        secret: process.env.JWT_RESET_SECRET,
        expiresIn: '15m',
      },
    );

    const linkRecuperacao = `${process.env.FRONTEND_URL}/nova-senha?token=${token}`;

    await this.mailService.enviarRecuperacao(
      user.user_email,
      user.user_nome,
      linkRecuperacao,
    );

    return {
      message:
        'Se o e-mail estiver cadastrado, você receberá um link de recuperação',
    };
  }

  async redefinirSenha(token: string, novaSenha: string) {
    let payload;

    try {
      payload = await this.jwtSevices.verifyAsync(token, {
        secret: process.env.JWT_RESET_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    if (payload.type !== 'password_reset') {
      throw new UnauthorizedException('Token inválido');
    }

    const usuario = await this.userRepositorio.ListarUserId(payload.sub);

    if (!usuario || !usuario.user_ativo) {
      throw new UnauthorizedException('Token inválido');
    }
    const senhaHash = await this.HashingService.hash(novaSenha);

    await this.userRepositorio.atualizarSenha(usuario.id_user, senhaHash);

    return {
      message: 'Senha alterada com sucesso',
    };
  }

  // Gera o par de tokens (usado no login e no refresh)
  private async gerarTokens(user: {
    id_user: number;
    user_email: string;
    user_tipo: string;
  }) {
    const accessToken = await this.signJwtAsync(
      user.id_user,
      this.jwtConfiguration.jWTtl,
      {
        email: user.user_email,
        role: user.user_tipo,
      },
    );

    const refreshToken = await this.signJwtAsync(
      user.id_user,
      this.jwtConfiguration.jWTtlRefreshTtl,
      { type: 'refresh' },
    );

    return { accessToken, refreshToken };
  }
}
