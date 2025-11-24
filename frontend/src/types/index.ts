export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  contactNo: string;
  createdAt: string;
}

export enum PropertyType {
  Apartment = 'Apartment',
  House = 'House',
  Commercial = 'Commercial',
  Land = 'Land',
}

export enum PropertyStatus {
  Available = 'Available',
  Sold = 'Sold',
}

export interface Property {
  id: string;
  userId: string;
  user?: User;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyStats {
  totalProperties: number;
  myActiveListings: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  contactNo: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  status?: PropertyStatus;
}
