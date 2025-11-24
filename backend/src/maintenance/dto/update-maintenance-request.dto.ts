import { IsOptional, IsEnum, IsString } from 'class-validator';
import { MaintenanceStatus } from '@prisma/client';
import { MaintenancePriority } from '../../types/maintenance.enum';

export class UpdateMaintenanceRequestDto {
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;
}
