'use client';

import Link from 'next/link';
import { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
              {property.title}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              property.status === 'Available' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {property.status}
            </span>
          </div>
          
          <p className="text-2xl font-bold text-blue-600 mb-3">
            ${property.price.toLocaleString()}
          </p>
          
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
