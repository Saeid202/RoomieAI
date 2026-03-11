import React, { useState, useEffect } from 'react';
import { deliveryService } from '@/services/ecommerceService';

interface OrderReviewStepProps {
  cartItems: any[];
  selectedDate: string;
}

export const OrderReviewStep: React.FC<OrderReviewStepProps> = ({
  cartItems,
  selectedDate,
}) => {
  const [zone, setZone] = useState<any>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    calculateTotals();
  }, [cartItems]);

  const calculateTotals = async () => {
    // Calculate subtotal
    const sub = cartItems.reduce((acc, item) => {
      return acc + (item.product?.price || 0) * item.quantity;
    }, 0);
    setSubtotal(sub);

    // Calculate tax (13% HST)
    const taxAmount = sub * 0.13;
    setTax(taxAmount);

    // Get delivery fee (placeholder)
    const zones = await deliveryService.getZones();
    if (zones.length > 0) {
      setZone(zones[0]);
      setDeliveryFee(zones[0].delivery_fee);
      setTotal(sub + taxAmount + zones[0].delivery_fee);
    } else {
      setTotal(sub + taxAmount);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-3">Order Items</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm pb-2 border-b">
              <div>
                <p className="font-medium">{item.product?.name}</p>
                <p className="text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (13% HST):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee:</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {selectedDate && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm">
            <span className="font-semibold">Delivery Date:</span>{' '}
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      )}
    </div>
  );
};
