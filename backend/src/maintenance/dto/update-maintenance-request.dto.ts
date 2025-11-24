import { IsOptional, IsEnum, IsString } from 'class-validator';
import { MaintenanceStatus } from '@prisma/client';

export class UpdateMaintenanceRequestDto {
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;
}
