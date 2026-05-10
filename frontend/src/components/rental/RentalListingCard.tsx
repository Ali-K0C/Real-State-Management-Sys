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
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden card-hover h-full flex flex-col">
      <div className="relative h-40 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-16 h-16 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isOccupied
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOccupied ? 'bg-red-500' : 'bg-emerald-500'}`} />
            {isOccupied ? 'Occupied' : 'Available'}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
          {property.title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.location}
        </p>
        
        <p className="text-xs text-gray-400 mb-4 line-clamp-2 flex-1">
          {property.description}
        </p>

        <div className="flex text-xs text-gray-500 gap-4 mb-4 py-3 border-t border-b border-gray-100">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {property.bedrooms} bd
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            {property.bathrooms} ba
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            {property.areaSqft} sqft
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Monthly Rent</span>
            <span className="text-xl font-bold text-emerald-600">
              Rs {Number(listing.monthlyRent).toLocaleString()}
              <span className="text-sm font-normal text-gray-400">/mo</span>
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Security Deposit</span>
            <span className="text-gray-700 font-medium">
              Rs {Number(listing.securityDeposit).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div>
            <p className="text-xs text-gray-400">Available From</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(listing.availableFrom).toLocaleDateString()}
            </p>
          </div>
          <Link
            href={`/rentals/${listing.id}`}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all btn-hover shadow-lg shadow-emerald-600/25"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
