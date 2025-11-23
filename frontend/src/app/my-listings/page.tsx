'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import PropertyCard from '@/components/property/PropertyCard';
import CreatePropertyModal from '@/components/property/CreatePropertyModal';
import EditPropertyModal from '@/components/property/EditPropertyModal';
import { api, ApiError } from '@/lib/api';
import { Property } from '@/types';

export default function MyListingsPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<Property[]>('/properties/my-listings');
      setProperties(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to load your listings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProperties();
  }, []);

  const handleCreateSuccess = () => {
    void fetchProperties();
  };

  const handleEditSuccess = () => {
    void fetchProperties();
  };

  const handleEditClick = (property: Property) => {
    setSelectedProperty(property);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(propertyId);
      await api.delete(`/properties/${propertyId}`);
      await fetchProperties();
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to delete property';
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (propertyId: string) => {
    router.push(`/properties/${propertyId}`);
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
              <p className="mt-2 text-gray-600">Manage your property listings</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              + Create Property
            </button>
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
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No properties yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Get started by creating your first property listing.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Property
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="relative">
                  <PropertyCard property={property} />
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(property.id)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleEditClick(property)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      disabled={deletingId === property.id}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === property.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <CreatePropertyModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />

        {selectedProperty && (
          <EditPropertyModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedProperty(null);
            }}
            onSuccess={handleEditSuccess}
            property={selectedProperty}
          />
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}
