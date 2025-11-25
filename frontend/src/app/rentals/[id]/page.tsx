'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import RentConfirmDialog from '@/components/rent/RentConfirmDialog';
import { rentalApi } from '@/lib/rental-api';
import { useUser } from '@/context/UserContext';
import type { RentalListing } from '@/types';

export default function RentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const id = params?.id as string;

  const [listing, setListing] = useState<RentalListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRentDialog, setShowRentDialog] = useState(false);

  const fetchListing = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await rentalApi.getListing(id);
      setListing(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load rental listing';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id, fetchListing]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !listing) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error || 'Listing not found'}
          </div>
          <button
            onClick={() => router.push('/rentals')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Rentals
          </button>
        </div>
      </AppLayout>
    );
  }

  const property = listing.property!;
  const isOccupied = listing.leases && listing.leases.length > 0;
  const activeLease = isOccupied && listing.leases ? listing.leases[0] : null;
  
  // Determine if user can rent: must be logged in, not the owner, and property must be available
  const isOwner = user && property.userId === user.id;
  const canRent = user && !isOwner && !isOccupied && property.status === 'Available';

  const handleRent = () => {
    // Placeholder – will call lease creation in next PR
    setShowRentDialog(true);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/rentals')}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Rentals
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <p className="text-lg text-gray-600">
                  📍 {property.location}
                </p>
                <p className="text-sm text-gray-500">{property.address}</p>
              </div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  isOccupied
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {isOccupied ? 'Currently Occupied' : 'Available for Rent'}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Rent Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Rental Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${listing.monthlyRent.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Security Deposit</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${listing.securityDeposit.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Available From</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Date(listing.availableFrom).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Lease Duration</p>
                <p className="text-lg font-medium text-gray-900">
                  {listing.leaseDuration} months
                </p>
              </div>
            </div>

            {/* Property Details */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Property Details
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="text-lg font-medium text-gray-900">
                    {property.propertyType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                  <p className="text-lg font-medium text-gray-900">
                    {property.bedrooms}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                  <p className="text-lg font-medium text-gray-900">
                    {property.bathrooms}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="text-lg font-medium text-gray-900">
                    {property.areaSqft} sqft
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Occupancy Status */}
            {isOccupied && activeLease && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Occupancy Information
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 font-medium mb-2">
                    This property is currently occupied
                  </p>
                  <p className="text-sm text-amber-700">
                    Lease Status: <span className="font-medium">{activeLease.status}</span>
                  </p>
                  {activeLease.endDate && (
                    <p className="text-sm text-amber-700">
                      Expected Available: {new Date(activeLease.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Landlord Information */}
            {property.user && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Landlord Information
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">
                    {property.user.firstName} {property.user.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {property.user.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {property.user.contactNo}
                  </p>
                </div>
              </div>
            )}

            {/* Action Button */}
            {canRent && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleRent}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Rent This Property
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  Contact the landlord to initiate a lease agreement
                </p>
              </div>
            )}
            
            {/* Show message if not logged in */}
            {!user && !isOccupied && property.status === 'Available' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">
                    Please <a href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">log in</a> to rent this property.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rent Confirmation Dialog */}
        {listing && showRentDialog && (
          <RentConfirmDialog
            isOpen={showRentDialog}
            onClose={() => setShowRentDialog(false)}
            listing={listing}
          />
        )}
      </div>
    </AppLayout>
  );
}
