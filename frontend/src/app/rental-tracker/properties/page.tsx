'use client';

import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import PropertiesTab from '@/components/rental-tracker/PropertiesTab';

export default function RentalTrackerPropertiesPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Properties</h1>
            <p className="text-gray-600">Manage your rental properties</p>
          </div>

          {/* Quick Nav */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => router.push('/rental-tracker')}
              className="px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/rental-tracker/properties')}
              className="px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Properties
            </button>
            <button
              onClick={() => router.push('/rental-tracker/leases')}
              className="px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Leases
            </button>
            <button
              onClick={() => router.push('/rental-tracker/maintenance')}
              className="px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Maintenance
            </button>
          </div>

          {/* Properties Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <PropertiesTab />
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
