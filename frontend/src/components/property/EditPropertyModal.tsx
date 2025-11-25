'use client';

import { useState, useEffect, FormEvent } from 'react';
import Modal from '@/components/ui/Modal';
import { api, ApiError } from '@/lib/api';
import { Property, UpdatePropertyDto, PropertyType, PropertyStatus, ListingType } from '@/types';

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  property: Property;
}

export default function EditPropertyModal({ isOpen, onClose, onSuccess, property }: EditPropertyModalProps) {
  const [formData, setFormData] = useState<UpdatePropertyDto>({
    title: property.title,
    description: property.description,
    price: property.price,
    location: property.location,
    address: property.address,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqft: property.areaSqft,
    status: property.status,
    listingType: property.listingType,
  });
  const [monthlyRent, setMonthlyRent] = useState(property.monthlyRent?.toString() || '');
  const [securityDeposit, setSecurityDeposit] = useState(property.securityDeposit?.toString() || '');
  const [availableFrom, setAvailableFrom] = useState(property.availableFrom?.split('T')[0] || '');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: property.title,
        description: property.description,
        price: property.price,
        location: property.location,
        address: property.address,
        propertyType: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        areaSqft: property.areaSqft,
        status: property.status,
        listingType: property.listingType,
      });
      setMonthlyRent(property.monthlyRent?.toString() || '');
      setSecurityDeposit(property.securityDeposit?.toString() || '');
      setAvailableFrom(property.availableFrom?.split('T')[0] || '');
      setErrors([]);
    }
  }, [isOpen, property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['price', 'bedrooms', 'bathrooms', 'areaSqft'].includes(name) 
        ? parseFloat(value) || 0 
        : value,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (formData.title && !formData.title.trim()) {
      newErrors.push('Title cannot be empty');
    }

    if (formData.description && !formData.description.trim()) {
      newErrors.push('Description cannot be empty');
    }

    if (formData.price !== undefined && formData.price <= 0) {
      newErrors.push('Price must be greater than 0');
    }

    if (formData.location && !formData.location.trim()) {
      newErrors.push('Location cannot be empty');
    }

    if (formData.address && !formData.address.trim()) {
      newErrors.push('Address cannot be empty');
    }

    if (formData.bedrooms !== undefined && formData.bedrooms < 0) {
      newErrors.push('Bedrooms must be 0 or greater');
    }

    if (formData.bathrooms !== undefined && formData.bathrooms < 0) {
      newErrors.push('Bathrooms must be 0 or greater');
    }

    if (formData.areaSqft !== undefined && formData.areaSqft <= 0) {
      newErrors.push('Area must be greater than 0');
    }

    // Validate rental fields for FOR_RENT listings
    if (formData.listingType === ListingType.FOR_RENT) {
      if (!monthlyRent || parseFloat(monthlyRent) <= 0) {
        newErrors.push('Monthly Rent is required for rental listings');
      }
      if (!securityDeposit || parseFloat(securityDeposit) <= 0) {
        newErrors.push('Security Deposit is required for rental listings');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Build payload
      const payload: UpdatePropertyDto = { ...formData };
      
      // Add rental fields only for FOR_RENT listings
      if (formData.listingType === ListingType.FOR_RENT) {
        payload.monthlyRent = parseFloat(monthlyRent);
        payload.securityDeposit = parseFloat(securityDeposit);
        if (availableFrom) {
          payload.availableFrom = availableFrom;
        }
      }

      await api.put(`/properties/${property.id}`, payload);
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors || [err.message]);
      } else {
        setErrors(['An unexpected error occurred. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors([]);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Property">
      <form onSubmit={handleSubmit}>
        {errors.length > 0 && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.title || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={4}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.description || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                id="edit-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.price || ''}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="edit-propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type *
              </label>
              <select
                id="edit-propertyType"
                name="propertyType"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.propertyType || PropertyType.Apartment}
                onChange={handleChange}
                disabled={loading}
              >
                <option value={PropertyType.Apartment}>Apartment</option>
                <option value={PropertyType.House}>House</option>
                <option value={PropertyType.Commercial}>Commercial</option>
                <option value={PropertyType.Land}>Land</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="edit-listingType" className="block text-sm font-medium text-gray-700 mb-1">
              Listing Type *
            </label>
            <select
              id="edit-listingType"
              name="listingType"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.listingType || ListingType.FOR_SALE}
              onChange={handleChange}
              disabled={loading}
            >
              <option value={ListingType.FOR_SALE}>For Sale</option>
              <option value={ListingType.FOR_RENT}>For Rent</option>
            </select>
          </div>

          {formData.listingType === ListingType.FOR_RENT && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md">
              <div>
                <label htmlFor="edit-monthlyRent" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent ($) *
                </label>
                <input
                  id="edit-monthlyRent"
                  type="number"
                  min="0"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1500"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="edit-securityDeposit" className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit ($) *
                </label>
                <input
                  id="edit-securityDeposit"
                  type="number"
                  min="0"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="3000"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="edit-availableFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  Available From
                </label>
                <input
                  id="edit-availableFrom"
                  type="date"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              id="edit-location"
              name="location"
              type="text"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.location || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              id="edit-address"
              name="address"
              type="text"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.address || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="edit-bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms *
              </label>
              <input
                id="edit-bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.bedrooms || ''}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="edit-bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms *
              </label>
              <input
                id="edit-bathrooms"
                name="bathrooms"
                type="number"
                min="0"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.bathrooms || ''}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="edit-areaSqft" className="block text-sm font-medium text-gray-700 mb-1">
                Area (sqft) *
              </label>
              <input
                id="edit-areaSqft"
                name="areaSqft"
                type="number"
                min="0"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.areaSqft || ''}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="edit-status"
              name="status"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.status || PropertyStatus.Available}
              onChange={handleChange}
              disabled={loading}
            >
              <option value={PropertyStatus.Available}>Available</option>
              <option value={PropertyStatus.Sold}>Sold</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
