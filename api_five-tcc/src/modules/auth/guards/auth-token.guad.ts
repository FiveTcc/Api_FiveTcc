import { CanActivate, Injectable, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import JwtConfig from '../config/jwt.config';

@Injectable()
export class AuthTokenGuard implements CanActivate {
    constructor(private jwtService: JwtService,
        @Inject(JwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof JwtConfig>,
    ) { }

    // O método canActivate é chamado automaticamente pelo NestJS para determinar se a solicitação atual deve ser permitida ou negada. Ele verifica se o token JWT está presente no cabeçalho da solicitação, valida o token e adiciona as informações do usuário ao objeto de solicitação.
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        const request: Request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        

        if (!token) {
            throw new UnauthorizedException('Nâo Logado');
        }

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                this.jwtConfiguration,
            )

            
            // Adiciona as informações do usuário ao objeto de solicitação para que possam ser acessadas em outros lugares do aplicativo
            request['user'] = {
                id_user: payload.sub,
                email: payload.email,
                role: payload.role,
            };

            return true;

        } catch (error) {
            throw new UnauthorizedException('falha aou logar');
        }

    }


    extractTokenFromHeader(request: Request): string | undefined {
        const authorization = request.headers?.authorization;

        if (!authorization || typeof authorization !== 'string') {

            return undefined;
        }
        return authorization.split(' ')[1];
    }
}