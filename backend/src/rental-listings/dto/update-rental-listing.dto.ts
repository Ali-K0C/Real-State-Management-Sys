import { PartialType } from '@nestjs/mapped-types';
import { CreateRentalListingDto } from './create-rental-listing.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRentalListingDto extends PartialType(
  CreateRentalListingDto,
) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
