'use client';

import Link from 'next/link';
import { Property, ListingType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: Property;
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
  const isRentListing = property.listingType === ListingType.FOR_RENT;
  
  return (
    <Link href={isRentListing ? `/rentals/${property.id}` : `/properties/${property.id}`}>
      <Card className="overflow-hidden group hover:shadow-xl transition-shadow duration-200 cursor-pointer h-full">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isRentListing ? 'rent' : 'sale'}>
              {isRentListing ? 'For Rent' : 'For Sale'}
            </Badge>
            {property.status === 'Available' && (
              <Badge variant="success">Available</Badge>
            )}
            {property.status === 'Sold' && (
              <Badge variant="destructive">Sold</Badge>
            )}
            {property.status === 'Rented' && (
              <Badge className="bg-red-600 text-white hover:bg-red-700">Rented</Badge>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-foreground truncate">
            {property.title}
          </h3>
          
          <p className="text-sm text-muted-foreground truncate">
            {property.location}
          </p>
          
          <p className="text-xl font-bold text-primary">
            {isRentListing && property.monthlyRent ? (
              <>Rs {Number(property.monthlyRent).toLocaleString()} / mo</>
            ) : (
              <>Rs {Number(property.price).toLocaleString()}</>
            )}
          </p>
          
          {/* Show additional monthly rent for rental properties with rental listing */}
          {isForRent && monthlyRent && !isRentListing && (
            <p className="text-sm text-muted-foreground">
              Rent: Rs {Number(monthlyRent).toLocaleString()} / mo
            </p>
          )}
          
          <div className="flex text-xs text-muted-foreground gap-4 pt-2 border-t border-border">
            <span>{property.bedrooms} bd</span>
            <span>{property.bathrooms} ba</span>
            <span>{property.areaSqft} sqft</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
