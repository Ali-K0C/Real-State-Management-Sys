import { IsNotEmpty, IsEnum } from 'class-validator';
import { RentalLeaseStatus } from '@prisma/client';

export class UpdateLeaseStatusDto {
  @IsNotEmpty()
  @IsEnum(RentalLeaseStatus)
  status: RentalLeaseStatus;
}
