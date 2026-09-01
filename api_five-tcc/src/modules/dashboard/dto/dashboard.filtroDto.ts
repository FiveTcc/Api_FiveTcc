import { IsDateString, IsOptional } from 'class-validator';

export class DashboardFiltroDto {
    @IsOptional()
    @IsDateString()
    inicio?: string;

    @IsOptional()
    @IsDateString()
    fim?: string;
}
