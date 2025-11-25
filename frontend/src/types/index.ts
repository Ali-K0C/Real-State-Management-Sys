export enum UserRole {
  USER = 'USER',
  LANDLORD = 'LANDLORD',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  contactNo: string;
  role?: UserRole;
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
  Rented = 'Rented',
}

export enum ListingType {
  FOR_SALE = 'FOR_SALE',
  FOR_RENT = 'FOR_RENT',
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
  listingType?: ListingType;
  monthlyRent?: number | null;
  securityDeposit?: number | null;
  availableFrom?: string | null;
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
  listingType?: ListingType;
  monthlyRent?: number;
  securityDeposit?: number;
  availableFrom?: string;
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  status?: PropertyStatus;
}

// Rental types
export enum RentalLeaseStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED',
  CANCELED = 'CANCELED',
}

export enum RentPaymentStatus {
  DUE = 'DUE',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CHECK = 'CHECK',
  OTHER = 'OTHER',
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export interface RentalListing {
  id: string;
  propertyId: string;
  property?: Property;
  monthlyRent: number;
  securityDeposit: number;
  availableFrom: string;
  leaseDuration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  leases?: RentalLease[];
}

export interface RentalLease {
  id: string;
  rentalListingId: string;
  rentalListing?: RentalListing;
  landlordId: string;
  landlord?: User;
  tenantId: string;
  tenant?: User;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  paymentDay: number;
  status: RentalLeaseStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  payments?: RentPayment[];
}

export interface RentPayment {
  id: string;
  leaseId: string;
  lease?: RentalLease;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: RentPaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  property?: Property;
  requestedBy: string;
  user?: User;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LandlordStats {
  totalRentalProperties: number;
  occupiedProperties: number;
  vacantProperties: number;
  activeLeases: number;
  pendingLeases: number;
  overduePaymentsCount: number;
  upcomingDue: RentPayment[];
  topLocations: { location: string; count: number }[];
}

export interface LandlordPropertyOverview {
  listingId: string;
  property: Property;
  monthlyRent: number;
  isOccupied: boolean;
  currentLease?: {
    id: string;
    tenant: User;
    status: RentalLeaseStatus;
    startDate: string;
    endDate: string;
  };
  nextDueDate?: string;
  nextDueAmount?: number;
  nextDueStatus?: RentPaymentStatus;
}

export interface CreateRentalListingDto {
  propertyId: string;
  monthlyRent: number;
  securityDeposit: number;
  availableFrom: string;
  leaseDuration: number;
}

export interface UpdateRentalListingDto extends Partial<CreateRentalListingDto> {
  isActive?: boolean;
}

export interface CreateRentalLeaseDto {
  rentalListingId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  paymentDay: number;
  notes?: string;
}

export interface RecordPaymentDto {
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CreateMaintenanceRequestDto {
  propertyId: string;
  title: string;
  description: string;
  priority?: string;
}

export interface UpdateMaintenanceRequestDto {
  status?: MaintenanceStatus;
  notes?: string;
  priority?: string;
}
