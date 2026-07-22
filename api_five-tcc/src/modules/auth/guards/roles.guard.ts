import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lê as roles definidas no decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    // Se a rota não tiver @Roles(), libera o acesso
    if (!requiredRoles) {
      return true;
    }

    // Pega o usuário que o JwtAuthGuard colocou no request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Verifica se a role do usuário está permitida
    return requiredRoles.includes(user.role);
  }
}