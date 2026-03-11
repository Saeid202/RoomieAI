import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { shippingService } from '@/services/ecommerceService';

interface ShippingAddressStepProps {
  userId: string;
  selectedAddress: string;
  onAddressChange: (addressId: string) => void;
}

export const ShippingAddressStep: React.FC<ShippingAddressStepProps> = ({
  userId,
  selectedAddress,
  onAddressChange,
}) => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    province: 'ON',
    postal_code: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  const loadAddresses = async () => {
    try {
      const data = await shippingService.getAddresses(userId);
      setAddresses(data);
      if (data.length > 0 && !selectedAddress) {
        onAddressChange(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newAddress = await shippingService.addAddress(userId, {
        ...formData,
        is_default: addresses.length === 0,
      });
      setAddresses([...addresses, newAddress]);
      onAddressChange(newAddress.id);
      setFormData({
        full_name: '',
        phone: '',
        street_address: '',
        city: '',
        province: 'ON',
        postal_code: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add address:', error);
      alert('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {addresses.length === 0 ? (
        <p className="text-gray-600 mb-4">No addresses saved. Add one to continue.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <label
              key={address.id}
              className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="address"
                value={address.id}
                checked={selectedAddress === address.id}
                onChange={(e) => onAddressChange(e.target.value)}
                className="mt-1"
              />
              <div>
                <p className="font-semibold">{address.full_name}</p>
                <p className="text-sm text-gray-600">{address.street_address}</p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.province} {address.postal_code}
                </p>
                <p className="text-sm text-gray-600">{address.phone}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleAddAddress} className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Street Address"
            value={formData.street_address}
            onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              required
            />
            <select
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="ON">Ontario</option>
              <option value="QC">Quebec</option>
              <option value="BC">British Columbia</option>
              <option value="AB">Alberta</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Postal Code"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Address'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <Plus size={20} />
          Add New Address
        </button>
      )}
    </div>
  );
};
