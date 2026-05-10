'use client';

import Link from 'next/link';
import { Property, ListingType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: Property;
}

function isPropertyForRent(property: Property): boolean {
  if (property.rentalListing?.isActive) {
    return true;
  }
  return Boolean(property.isForRent && !property.rentalListing);
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const isForRent = isPropertyForRent(property);
  const monthlyRent = property.rentalListing?.monthlyRent;
  const isRentListing = property.listingType === ListingType.FOR_RENT;
  
  return (
    <Link href={isRentListing ? `/rentals/${property.id}` : `/properties/${property.id}`}>
      <Card className="overflow-hidden group cursor-pointer h-full bg-white border border-gray-100 shadow-sm card-hover">
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              isRentListing 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {isRentListing ? 'For Rent' : 'For Sale'}
            </span>
            {property.status === 'Available' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Available
              </span>
            )}
            {property.status === 'Sold' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Sold
              </span>
            )}
            {property.status === 'Rented' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                Rented
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
            {property.title}
          </h3>
          
          <p className="text-sm text-gray-500 truncate flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.location}
          </p>
          
          <p className="text-xl font-bold text-emerald-600">
            {isRentListing && property.monthlyRent ? (
              <>Rs {Number(property.monthlyRent).toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span></>
            ) : (
              <>Rs {Number(property.price).toLocaleString()}</>
            )}
          </p>
          
          {isForRent && monthlyRent && !isRentListing && (
            <p className="text-sm text-gray-500">
              Rent: Rs {Number(monthlyRent).toLocaleString()}/mo
            </p>
          )}
          
          <div className="flex text-xs text-gray-500 gap-4 pt-3 border-t border-gray-100">
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
        </CardContent>
      </Card>
    </Link>
  );
}
