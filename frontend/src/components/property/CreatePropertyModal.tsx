'use client';

import { useState, FormEvent } from 'react';
import Modal from '@/components/ui/Modal';
import { api, ApiError } from '@/lib/api';
import { CreatePropertyDto, PropertyType, ListingType } from '@/types';

interface CreatePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePropertyModal({ isOpen, onClose, onSuccess }: CreatePropertyModalProps) {
  const [formData, setFormData] = useState<CreatePropertyDto>({
    title: '',
    description: '',
    price: 0,
    location: '',
    address: '',
    propertyType: PropertyType.Apartment,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 0,
    listingType: ListingType.FOR_SALE,
  });
  const [monthlyRent, setMonthlyRent] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

    if (!formData.title.trim()) {
      newErrors.push('Title is required');
    }

    if (!formData.description.trim()) {
      newErrors.push('Description is required');
    }

    if (formData.price <= 0) {
      newErrors.push('Price must be greater than 0');
    }

    if (!formData.location.trim()) {
      newErrors.push('Location is required');
    }

    if (!formData.address.trim()) {
      newErrors.push('Address is required');
    }

    if (formData.bedrooms < 0) {
      newErrors.push('Bedrooms must be 0 or greater');
    }

    if (formData.bathrooms < 0) {
      newErrors.push('Bathrooms must be 0 or greater');
    }

    if (formData.areaSqft <= 0) {
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
      const payload: CreatePropertyDto = { ...formData };
      
      // Add rental fields only for FOR_RENT listings
      if (formData.listingType === ListingType.FOR_RENT) {
        payload.monthlyRent = parseFloat(monthlyRent);
        payload.securityDeposit = parseFloat(securityDeposit);
        if (availableFrom) {
          payload.availableFrom = availableFrom;
        }
      }

      await api.post('/properties', payload);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: 0,
        location: '',
        address: '',
        propertyType: PropertyType.Apartment,
        bedrooms: 1,
        bathrooms: 1,
        areaSqft: 0,
        listingType: ListingType.FOR_SALE,
      });
      setMonthlyRent('');
      setSecurityDeposit('');
      setAvailableFrom('');
      
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Property">
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Beautiful Family Home"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your property..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="250000"
                value={formData.price || ''}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type *
              </label>
              <select
                id="propertyType"
                name="propertyType"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.propertyType}
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
            <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-1">
              Listing Type *
            </label>
            <select
              id="listingType"
              name="listingType"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.listingType}
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
                <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent ($) *
                </label>
                <input
                  id="monthlyRent"
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
                <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit ($) *
                </label>
                <input
                  id="securityDeposit"
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
                <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  Available From
                </label>
                <input
                  id="availableFrom"
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
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="New York, NY"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="123 Main Street"
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms *
              </label>
              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.bedrooms}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms *
              </label>
              <input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="0"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.bathrooms}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="areaSqft" className="block text-sm font-medium text-gray-700 mb-1">
                Area (sqft) *
              </label>
              <input
                id="areaSqft"
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
            {loading ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
