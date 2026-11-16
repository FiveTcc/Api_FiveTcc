import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { error } from 'console';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lê as roles definidas no decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se a rota não tiver @Roles(), libera o acesso
    if (!requiredRoles) {
      return true;
    }

    // Pega o usuário que o JwtAuthGuard colocou no request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.role) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    // Usuário autenticado, mas sem a role necessária
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Usuário não possui permissão para acessar este recurso',
      );
    }

    // Usuário possui a role necessária
    return true;

    // // Verifica se a role do usuário está permitida
    // return requiredRoles.includes(user.role);
  }
}
