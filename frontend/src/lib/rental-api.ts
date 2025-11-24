import { api } from './api';
import type {
  PaginatedResponse,
  RentalListing,
  CreateRentalListingDto,
  UpdateRentalListingDto,
  RentalLease,
  CreateRentalLeaseDto,
  RentPayment,
  RecordPaymentDto,
  LandlordStats,
  LandlordPropertyOverview,
  MaintenanceRequest,
  CreateMaintenanceRequestDto,
  UpdateMaintenanceRequestDto,
  RentalLeaseStatus,
  MaintenanceStatus,
} from '@/types';

export const rentalApi = {
  // Rental Listings
  getListings: (params?: {
    page?: number;
    limit?: number;
    location?: string;
    minRent?: number;
    maxRent?: number;
    bedrooms?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.location) queryParams.append('location', params.location);
    if (params?.minRent) queryParams.append('minRent', params.minRent.toString());
    if (params?.maxRent) queryParams.append('maxRent', params.maxRent.toString());
    if (params?.bedrooms) queryParams.append('bedrooms', params.bedrooms.toString());

    return api.get<PaginatedResponse<RentalListing>>(
      `/rentals/listings?${queryParams.toString()}`
    );
  },

  getListing: (id: string) =>
    api.get<RentalListing>(`/rentals/listings/${id}`),

  createListing: (data: CreateRentalListingDto) =>
    api.post<RentalListing>('/rentals/listings', data),

  updateListing: (id: string, data: UpdateRentalListingDto) =>
    api.patch<RentalListing>(`/rentals/listings/${id}`, data),

  deleteListing: (id: string) =>
    api.delete(`/rentals/listings/${id}`),

  // Rental Leases
  createLease: (data: CreateRentalLeaseDto) =>
    api.post<RentalLease>('/rentals/leases', data),

  getLease: (id: string) =>
    api.get<RentalLease>(`/rentals/leases/${id}`),

  getLandlordLeases: (status?: RentalLeaseStatus) => {
    const params = new URLSearchParams({ landlord: 'true' });
    if (status) params.append('status', status);
    return api.get<RentalLease[]>(`/rentals/leases?${params.toString()}`);
  },

  getTenantLeases: (status?: RentalLeaseStatus) => {
    const params = new URLSearchParams({ tenant: 'true' });
    if (status) params.append('status', status);
    return api.get<RentalLease[]>(`/rentals/leases?${params.toString()}`);
  },

  updateLeaseStatus: (id: string, status: RentalLeaseStatus) =>
    api.patch<RentalLease>(`/rentals/leases/${id}/status`, { status }),

  // Rent Payments
  getPaymentsByLease: (leaseId: string) =>
    api.get<RentPayment[]>(`/rentals/payments?leaseId=${leaseId}`),

  markPaymentPaid: (id: string, data: RecordPaymentDto) =>
    api.patch<RentPayment>(`/rentals/payments/${id}/pay`, data),

  waivePayment: (id: string) =>
    api.patch<RentPayment>(`/rentals/payments/${id}/waive`, {}),

  markPaymentOverdue: (id: string) =>
    api.patch<RentPayment>(`/rentals/payments/${id}/mark-overdue`, {}),

  // Landlord Stats
  getLandlordStats: () =>
    api.get<LandlordStats>('/rentals/landlord/stats'),

  getLandlordOverview: () =>
    api.get<LandlordPropertyOverview[]>('/rentals/landlord/overview'),

  // Maintenance Requests
  createMaintenanceRequest: (data: CreateMaintenanceRequestDto) =>
    api.post<MaintenanceRequest>('/rentals/maintenance', data),

  getMaintenanceRequests: (params?: {
    propertyId?: string;
    status?: MaintenanceStatus;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.propertyId) queryParams.append('propertyId', params.propertyId);
    if (params?.status) queryParams.append('status', params.status);

    return api.get<MaintenanceRequest[]>(
      `/rentals/maintenance?${queryParams.toString()}`
    );
  },

  getMaintenanceRequest: (id: string) =>
    api.get<MaintenanceRequest>(`/rentals/maintenance/${id}`),

  updateMaintenanceRequest: (id: string, data: UpdateMaintenanceRequestDto) =>
    api.patch<MaintenanceRequest>(`/rentals/maintenance/${id}`, data),
};
