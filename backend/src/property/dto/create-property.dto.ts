import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  IsOptional,
  IsDateString,
} from 'class-validator';

enum PropertyType {
  Apartment = 'Apartment',
  House = 'House',
  Commercial = 'Commercial',
  Land = 'Land',
}

enum PropertyStatus {
  Available = 'Available',
  Sold = 'Sold',
}

export enum ListingType {
  FOR_SALE = 'FOR_SALE',
  FOR_RENT = 'FOR_RENT',
}

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsNumber()
  @Min(0)
  bedrooms: number;

  @IsNumber()
  @Min(0)
  bathrooms: number;

  @IsNumber()
  @Min(0)
  areaSqft: number;

  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus = PropertyStatus.Available;

  @IsEnum(ListingType)
  @IsOptional()
  listingType?: ListingType = ListingType.FOR_SALE;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyRent?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  securityDeposit?: number;

  @IsDateString()
  @IsOptional()
  availableFrom?: string;
}
