import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsInt,
  Min,
  IsUUID,
} from 'class-validator';

export class CreateRentalListingDto {
  @IsNotEmpty()
  @IsUUID()
  propertyId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  securityDeposit: number;

  @IsNotEmpty()
  @IsDateString()
  availableFrom: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  leaseDuration: number; // in months
}
