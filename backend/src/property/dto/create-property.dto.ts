import { IsNotEmpty, IsString, IsNumber, IsEnum, Min } from 'class-validator';

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
  @IsNotEmpty()
  status?: PropertyStatus = PropertyStatus.Available;
}
