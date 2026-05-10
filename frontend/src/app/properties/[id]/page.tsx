'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import EditPropertyModal from '@/components/property/EditPropertyModal';
import BuyConfirmDialog from '@/components/property/BuyConfirmDialog';
import { DetailPageSkeleton } from '@/components/ui/Skeleton';
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
        <div className="mb-6 animate-fade-in-down">
          <Link href="/properties" className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Listings
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
            {error}
          </div>
        )}

        {loading ? (
          <DetailPageSkeleton />
        ) : property ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{property.title}</h1>
                  <div className="flex items-center gap-4 text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.location}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      property.status === 'Available' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : property.status === 'Sold'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-emerald-600">
                    Rs {Number(property.price).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-gray-100 py-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Type</div>
                    <div className="text-lg font-semibold text-gray-900">{property.propertyType}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Bedrooms</div>
                    <div className="text-lg font-semibold text-gray-900">{property.bedrooms}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Bathrooms</div>
                    <div className="text-lg font-semibold text-gray-900">{property.bathrooms}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Area</div>
                    <div className="text-lg font-semibold text-gray-900">{property.areaSqft} sqft</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{property.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Address</h2>
                <p className="text-gray-600 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.address}
                </p>
              </div>

              {property.user && (
                <div className="border-t border-gray-100 pt-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Seller Information</h2>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Name</div>
                          <div className="font-semibold text-gray-900">
                            {property.user.firstName} {property.user.lastName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Contact</div>
                          <div className="font-semibold text-gray-900">{property.user.contactNo}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="font-semibold text-gray-900">{property.user.email}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {purchaseSuccess && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center animate-fade-in">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Property purchased successfully!
                </div>
              )}

              {canBuy && (
                <div className="border-t border-gray-100 pt-6">
                  <button
                    onClick={() => setIsBuyDialogOpen(true)}
                    className="w-full sm:w-auto px-8 py-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all btn-hover shadow-lg shadow-emerald-600/25 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
