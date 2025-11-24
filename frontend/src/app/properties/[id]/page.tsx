'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import EditPropertyModal from '@/components/property/EditPropertyModal';
import BuyConfirmDialog from '@/components/property/BuyConfirmDialog';
import { api, ApiError } from '@/lib/api';
import { Property } from '@/types';
import { useUser } from '@/context/UserContext';

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const propertyId = params.id as string;

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<Property>(`/properties/${propertyId}`);
      setProperty(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to load property details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      void fetchProperty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const handleEditSuccess = () => {
    void fetchProperty();
  };

  const handleBuySuccess = (updatedProperty: Property) => {
    setProperty(updatedProperty);
    setPurchaseSuccess(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/properties/${propertyId}`);
      router.push('/properties');
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to delete property';
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = user && property && user.id === property.userId;
  const canBuy = user && property && !isOwner && property.status === 'Available';

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/properties" className="text-blue-600 hover:text-blue-800">
            ← Back to Listings
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : property ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {property.location}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      property.status === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    ${property.price.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Type</div>
                    <div className="text-lg font-semibold">{property.propertyType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Bedrooms</div>
                    <div className="text-lg font-semibold">{property.bedrooms}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Bathrooms</div>
                    <div className="text-lg font-semibold">{property.bathrooms}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Area</div>
                    <div className="text-lg font-semibold">{property.areaSqft} sqft</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Address</h2>
                <p className="text-gray-700">{property.address}</p>
              </div>

              {property.user && (
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Seller Information</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Name</div>
                        <div className="font-medium">
                          {property.user.firstName} {property.user.lastName}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Contact</div>
                        <div className="font-medium">{property.user.contactNo}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium">{property.user.email}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Success Message */}
              {purchaseSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Property purchased successfully!
                </div>
              )}

              {/* Buy Now Button */}
              {canBuy && (
                <div className="border-t border-gray-200 pt-6">
                  <button
                    onClick={() => setIsBuyDialogOpen(true)}
                    className="w-full sm:w-auto px-8 py-3 border border-transparent rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Buy Now
                  </button>
                </div>
              )}

              {isOwner && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Management</h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-6 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Edit Property
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-6 py-2 border border-transparent rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting ? 'Deleting...' : 'Delete Property'}
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="text-sm text-gray-500">
                  Listed on {new Date(property.createdAt).toLocaleDateString()}
                  {property.updatedAt !== property.createdAt && (
                    <> • Updated on {new Date(property.updatedAt).toLocaleDateString()}</>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Property not found</p>
            <Link
              href="/properties"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              Browse all properties
            </Link>
          </div>
        )}

        {property && isEditModalOpen && (
          <EditPropertyModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={handleEditSuccess}
            property={property}
          />
        )}

        {property && isBuyDialogOpen && (
          <BuyConfirmDialog
            isOpen={isBuyDialogOpen}
            onClose={() => setIsBuyDialogOpen(false)}
            onSuccess={handleBuySuccess}
            property={property}
          />
        )}
      </div>
    </AppLayout>
  );
}
