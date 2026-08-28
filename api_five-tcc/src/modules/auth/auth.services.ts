import { Injectable, Inject, UnauthorizedException, NotFoundException } from "@nestjs/common";
import { LoginDto } from "./auth.dto/login.dto";
import { LogonRefreshTokenDto } from "./auth.dto/logon.dto";
import { UserRepositorio } from "../users/userRepositorio";
import type { ConfigType } from '@nestjs/config';
import { HashingService } from "./hashing/hashing.service";
import jwtConfig from "./config/jwt.config";
import { JwtService } from "@nestjs/jwt";
import { Roles } from "./decorators/roles.decorator";
import { MailService } from '../email/mail.sevice';
import { User } from "src/db/schemas";



@Injectable()
export class AuthServices {

    constructor(
        private readonly userRepositorio: UserRepositorio,
        private readonly HashingService: HashingService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly jwtSevices: JwtService,
        private readonly mailService: MailService
    ) {
        console.log(jwtConfiguration)
    }

    async Login(loginDto: LoginDto) {


        const user = await this.userRepositorio.VerificarEmailExistente(
            loginDto.user_email);


        if (!user) {
            throw new UnauthorizedException(
                'Usuário ou senha inválidos',
            );
        }

        const passwordisValid = await this.HashingService.compare(
            loginDto.user_senha,
            user.user_senha
        );

        if (!passwordisValid) {
            throw new UnauthorizedException(
                'Usuário ou senha inválidos'
            )
        }

        // Gerar o token JWT
        const accessToken = await this.signJwtAsync(
            user.id_user,
            this.jwtConfiguration.jWTtl,
            {
                email: user.user_email,
                role: user.user_tipo

            });


        const refreshToken = await this.signJwtAsync(
            user.id_user,
            this.jwtConfiguration.jWTtlRefreshTtl,
        );

        return {
            accessToken,
            refreshToken
        }
    }

    // 
    private async signJwtAsync<T>(sub: number, expiresIn: number, payload?: T) {
        return await this.jwtSevices.signAsync({
            sub,
            ...payload,
        },
            {
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
                expiresIn,
            }

        );
    }

    async refreshTokens(logonRefreshTokenDto: LogonRefreshTokenDto) {

    }


    // Recuperar senha
    async solocitarRecuperacaoSenha(email: string) {

        const user = await this.userRepositorio.VerificarEmailExistente(email);

        if (!user) {

            return {
                message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação'
            }
        };

        // Gerar token de redefinição de senha
        const token = await this.jwtSevices.signAsync(
            {
                sub: user.id_user,
                email: user.user_email,
                type: 'password_reset'
            }
            , {
                 secret: process.env.JWT_RESET_SECRET,
                expiresIn: '15m'
            },
        );

        console.log('TOKEN DE RECUPERAÇÃO:', token);

        const linkRecuperacao = `${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`;

        await this.mailService.enviarRecuperacao(
            user.user_email,
            user.user_nome,
            linkRecuperacao
        );

        return {
            message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação'
        }

    }

    async redefinirSenha(token: string, novaSenha: string) {

        let payload;

        try {

            payload = await this.jwtSevices.verifyAsync(
                token,
                {
                    secret: process.env.JWT_RESET_SECRET,
                }
            )

        } catch {
            throw new UnauthorizedException(
                'Token inválido ou expirado',
            );

        }

        if (payload.type !== 'password_reset') {

            throw new UnauthorizedException(
                'Token inválido',
            );
        }

        const resultado =
            await this.userRepositorio.ListarUserId(payload.sub);

        const usuario = resultado[0];

        if (!usuario) {
            throw new NotFoundException(
                'Usuário não encontrado',
            );
        }

        const senhaHash = await this.HashingService.hash(novaSenha);

        await this.userRepositorio.atualizarSenha(
            usuario.id_user,
            senhaHash,
        );


        return {
            message: 'Senha alterada com sucesso',
        };




    }

}
