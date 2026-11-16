import { Controller, Post, Body } from '@nestjs/common';
import { LoginDto } from './auth.dto/login.dto';
import { AuthServices } from './auth.services';
import { LogonRefreshTokenDto } from './auth.dto/logon.dto';
import { RecuperarSenhaDto } from './mail.dtos/recuperarSenha.dto';
import { RedefinirSenhaDto } from './mail.dtos/redefinirSenha.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthServices) {}

  // Rota de login
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return await this.AuthService.Login(loginDto);
  }

  // Rota de Logon
  @Post('/refresh')
  refresh(@Body() logonRefreshTokenDto: LogonRefreshTokenDto) {
    return this.AuthService.refreshTokens(logonRefreshTokenDto);
  }

  // Solicitar recuperação de senha
  @Post('recuperar-senha')
  async solicitarRecuperacaoSenha(@Body() dto: RecuperarSenhaDto) {
    return await this.AuthService.solocitarRecuperacaoSenha(dto.email);
  }

  // Redefinir senha
  @Post('redefinir-senha')
  async redefinirSenha(@Body() dto: RedefinirSenhaDto) {
    return await this.AuthService.redefinirSenha(dto.token, dto.novaSenha);
  }
}
