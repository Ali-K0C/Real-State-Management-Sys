'use client';

import Link from 'next/link';
import { Property, ListingType } from '@/types';

interface PropertyCardProps {
  property: Property;
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Available':
      return 'bg-green-100 text-green-800';
    case 'Rented':
      return 'bg-red-100 text-red-800';
    case 'Sold':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Determines if a property is available for rent.
 * A property is considered for rent if it has an active rental listing.
 */
function isPropertyForRent(property: Property): boolean {
  // Primary check: if there's an active rental listing
  if (property.rentalListing?.isActive) {
    return true;
  }
  // Fallback: use isForRent flag if no rental listing data is available
  return Boolean(property.isForRent && !property.rentalListing);
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const isForRent = isPropertyForRent(property);
  const monthlyRent = property.rentalListing?.monthlyRent;
  
  return (
    <Link href={`/properties/${property.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mb-2 ${
                property.listingType === ListingType.FOR_RENT 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {property.listingType === ListingType.FOR_RENT ? 'For Rent' : 'For Sale'}
              </span>
              <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
                {property.title}
              </h3>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              property.status === 'Available' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {property.status}
            </span>
          </div>
          
          <p className="text-2xl font-bold text-blue-600 mb-3">
            {property.listingType === ListingType.FOR_RENT && property.monthlyRent ? (
              <>
                ${property.monthlyRent.toLocaleString()}/mo
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Value: ${property.price.toLocaleString()})
                </span>
              </>
            ) : (
              <>${property.price.toLocaleString()}</>
            )}
          </p>
          
          {/* Show monthly rent for rental properties */}
          {isForRent && monthlyRent && (
            <p className="text-sm text-gray-600 mb-2">
              Monthly Rent: ${Number(monthlyRent).toLocaleString()}/mo
            </p>
          )}
          
          {/* Show rental badge */}
          {isForRent && (
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded mb-2">
              For Rent
            </span>
          )}
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>
          
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center">
              <span className="font-medium">Type:</span>
              <span className="ml-2">{property.propertyType}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Location:</span>
              <span className="ml-2">{property.location}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>{property.bedrooms} bed</span>
              <span>{property.bathrooms} bath</span>
              <span>{property.areaSqft} sqft</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
