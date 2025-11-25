import {
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRentalLeaseDto {
  @IsNotEmpty()
  @IsUUID()
  rentalListingId: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(31)
  paymentDay: number; // day of month (1-31)

  @IsOptional()
  @IsString()
  notes?: string;
}
