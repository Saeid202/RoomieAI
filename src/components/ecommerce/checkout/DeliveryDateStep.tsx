import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { deliveryService } from '@/services/ecommerceService';

interface DeliveryDateStepProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedAddress: string;
}

export const DeliveryDateStep: React.FC<DeliveryDateStepProps> = ({
  selectedDate,
  onDateChange,
  selectedAddress,
}) => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [zones, setZones] = useState<any[]>([]);

  useEffect(() => {
    loadDeliveryInfo();
  }, []);

  const loadDeliveryInfo = async () => {
    try {
      const zonesData = await deliveryService.getZones();
      setZones(zonesData);

      // Generate available dates (next 7 days)
      const dates = [];
      for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      setAvailableDates(dates);

      if (dates.length > 0 && !selectedDate) {
        onDateChange(dates[0]);
      }
    } catch (error) {
      console.error('Failed to load delivery info:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar size={20} />
          Select Delivery Date
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {availableDates.map((date) => (
            <button
              key={date}
              onClick={() => onDateChange(date)}
              className={`p-3 border rounded-lg text-center transition ${
                selectedDate === date
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:border-blue-600'
              }`}
            >
              <div className="font-semibold">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-sm">
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Delivery Zones</h4>
        <div className="space-y-2 text-sm">
          {zones.map((zone) => (
            <div key={zone.id} className="flex justify-between">
              <span>{zone.name}</span>
              <span className="font-semibold">${zone.delivery_fee.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
