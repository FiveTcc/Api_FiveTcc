import { Injectable, Inject, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./auth.dto/login.dto";
import { LogonRefreshTokenDto } from "./auth.dto/logon.dto";
import { UserRepositorio } from "../users/userRepositorio";
import type { ConfigType } from '@nestjs/config';
import { HashingService } from "./hashing/hashing.service";
import jwtConfig from "./config/jwt.config";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthServices {

    constructor(
        private readonly userRepositorio: UserRepositorio,
        private readonly HashingService: HashingService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly jwtSevices: JwtService
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
        const acceasToken = await this.signJwtAsync(
            user.id_user,
            this.jwtConfiguration.jWTtl,
            { email: user.user_email });


        const refreshToken = await this.signJwtAsync(
            user.id_user,
            this.jwtConfiguration.jWTtlRefreshTtl,
            );

        return {
            acceasToken,
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

}
