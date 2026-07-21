import { Injectable } from "@nestjs/common";
import { DashboardRepository } from "./dashboard.repository";

@Injectable()
export class DashboardService {
    constructor( private readonly dashboardRepository: DashboardRepository) { }

    async dashboardTotal() {
        return await this.dashboardRepository.dashboardTotal();
    }

    async dashboardUsuarios() {
        return await this.dashboardRepository.dashboardUsuarios();
    }

    async dashboardAmbientes() {
        return await this.dashboardRepository.dashboardAmbientes();
    }

    async dashboardComponentes() {
        return await this.dashboardRepository.dashboardComponentes();
    }

}