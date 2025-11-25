'use client';

import { useState, useEffect, useCallback } from 'react';
import { rentalApi } from '@/lib/rental-api';
import { MaintenanceRequest, MaintenanceStatus } from '@/types';

const STATUS_OPTIONS: MaintenanceStatus[] = [
  MaintenanceStatus.PENDING,
  MaintenanceStatus.IN_PROGRESS,
  MaintenanceStatus.COMPLETED,
  MaintenanceStatus.CANCELED,
];

export default function MaintenanceTab() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rentalApi.getMaintenanceRequests();
      setRequests(data);
    } catch (err: unknown) {
      const fetchError = err instanceof Error ? err.message : 'Failed to load maintenance requests';
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusChange = async (id: string, newStatus: MaintenanceStatus) => {
    setUpdatingId(id);
    try {
      await rentalApi.updateMaintenanceRequest(id, { status: newStatus });
      // Update local state
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
      );
    } catch (err: unknown) {
      const updateError = err instanceof Error ? err.message : 'Failed to update status';
      setError(updateError);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status: MaintenanceStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <span className="ml-3 text-gray-600">Loading maintenance requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No maintenance requests found.</p>
        <p className="text-sm text-gray-500 mt-2">
          Maintenance requests from your properties will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Maintenance Requests ({requests.length})
        </h2>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityBadgeClass(
                      request.priority
                    )}`}
                  >
                    {request.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <span className="font-medium">Property:</span>{' '}
                    {request.property?.title || 'N/A'} - {request.property?.location || 'N/A'}
                  </p>
                  <p>
                    <span className="font-medium">Requested by:</span>{' '}
                    {request.user?.firstName} {request.user?.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(
                    request.status
                  )}`}
                >
                  {request.status.replace('_', ' ')}
                </span>
                <select
                  value={request.status}
                  onChange={(e) =>
                    handleStatusChange(request.id, e.target.value as MaintenanceStatus)
                  }
                  disabled={updatingId === request.id}
                  className="mt-2 block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
