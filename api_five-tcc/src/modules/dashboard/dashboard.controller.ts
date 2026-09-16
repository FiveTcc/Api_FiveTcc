import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthTokenGuard } from '../auth/guards/auth-token.guad'; 
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserTipo } from '../common/enums/userTipo.enum';
import { DashboardService } from './dashboard.service';

interface AuthenticatedRequest extends Request {
  user: { id_user: number; role: UserTipo };
}

@UseGuards(AuthTokenGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(UserTipo.ADMINISTRADOR, UserTipo.TECNICO, UserTipo.PROFESSOR)
  @Get()
  async getDashboard(@Req() req: AuthenticatedRequest) {
    const { id_user, role } = req.user;
    return this.dashboardService.getDashboardData(id_user, role);
  }
}