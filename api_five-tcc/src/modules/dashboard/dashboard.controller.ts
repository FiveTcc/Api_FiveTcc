import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthTokenGuard } from '../auth/guards/auth-token.guad'; 
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';


@UseGuards(AuthTokenGuard, RolesGuard)
@Roles('admin','tecnico','funcionario')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async dashboard(@Req() req: Request) {
    return this.dashboardService.dashboardData(
      req['user'].id_user,
      req['user'].role,
    );
  }
}