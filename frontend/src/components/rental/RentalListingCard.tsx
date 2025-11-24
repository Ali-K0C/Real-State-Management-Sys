'use client';

import Link from 'next/link';
import type { RentalListing } from '@/types';

interface RentalListingCardProps {
  listing: RentalListing;
}

export default function RentalListingCard({ listing }: RentalListingCardProps) {
  const isOccupied = listing.leases && listing.leases.length > 0;
  const property = listing.property;

  if (!property) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        {/* Header with status badge */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {property.title}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isOccupied
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {isOccupied ? 'Occupied' : 'Available'}
          </span>
        </div>

        {/* Location */}
        <p className="text-sm text-gray-600 mb-2">
          📍 {property.location}
        </p>
        <p className="text-xs text-gray-500 mb-4">{property.address}</p>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {property.description}
        </p>

        {/* Property Details */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Bedrooms</p>
            <p className="text-sm font-semibold text-gray-900">
              {property.bedrooms}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Bathrooms</p>
            <p className="text-sm font-semibold text-gray-900">
              {property.bathrooms}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Area</p>
            <p className="text-sm font-semibold text-gray-900">
              {property.areaSqft} sqft
            </p>
          </div>
        </div>

        {/* Rental Details */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">Monthly Rent</p>
            <p className="text-2xl font-bold text-blue-600">
              ${listing.monthlyRent.toLocaleString()}
            </p>
          </div>
          <div className="flex justify-between items-center text-sm">
            <p className="text-gray-600">Security Deposit</p>
            <p className="text-gray-900 font-medium">
              ${listing.securityDeposit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Available From */}
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Available From</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(listing.availableFrom).toLocaleDateString()}
            </p>
          </div>
          <Link
            href={`/rentals/${listing.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
