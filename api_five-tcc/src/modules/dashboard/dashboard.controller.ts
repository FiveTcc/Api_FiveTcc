import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthTokenGuard } from '../auth/guards/auth-token.guad'; 
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';


@UseGuards(AuthTokenGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('admin','tecnico','professor')
  @Get()
  async getDashboard(@Req() req: Request) {
    return this.dashboardService.getDashboardData(
      req['user'].id_user,
      req['user'].role,
    );
  }
}