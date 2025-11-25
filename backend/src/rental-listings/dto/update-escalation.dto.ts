import { IsBoolean, IsOptional, IsNumber, IsInt, Min } from 'class-validator';

export class UpdateEscalationDto {
  @IsOptional()
  @IsBoolean()
  rentEscalationEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  escalationPercentage?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  escalationIntervalMonths?: number;
}
