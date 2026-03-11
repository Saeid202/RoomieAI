import React, { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentStepProps {
  cartItems: any[];
}

export const PaymentStep: React.FC<PaymentStepProps> = ({ cartItems }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardData({ ...cardData, cardNumber: value });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setCardData({ ...cardData, expiryDate: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-3">Payment Method</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <CreditCard size={20} />
            <span>Credit/Debit Card</span>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="paypal"
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>PayPal</span>
          </label>
        </div>
      </div>

      {paymentMethod === 'card' && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Cardholder Name"
            value={cardData.cardholderName}
            onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Card Number"
            value={cardData.cardNumber}
            onChange={handleCardNumberChange}
            maxLength={19}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="MM/YY"
              value={cardData.expiryDate}
              onChange={handleExpiryChange}
              maxLength={5}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="CVV"
              value={cardData.cvv}
              onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.slice(0, 4) })}
              maxLength={4}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
        <Lock size={20} className="text-blue-600 flex-shrink-0 mt-1" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900">Secure Payment</p>
          <p className="text-blue-800">
            Your payment information is encrypted and secure. We never store your full card details.
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
        <p className="font-semibold mb-1">Test Mode</p>
        <p>This is a test environment. Use test card numbers for testing.</p>
      </div>
    </div>
  );
};
