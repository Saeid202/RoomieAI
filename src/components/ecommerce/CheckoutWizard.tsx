import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cartService, shippingService, deliveryService, orderService } from '@/services/ecommerceService';
import { ShippingAddressStep } from './checkout/ShippingAddressStep';
import { DeliveryDateStep } from './checkout/DeliveryDateStep';
import { OrderReviewStep } from './checkout/OrderReviewStep';
import { PaymentStep } from './checkout/PaymentStep';

interface CheckoutWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutWizard: React.FC<CheckoutWizardProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const steps = [
    { title: 'Shipping Address', component: ShippingAddressStep },
    { title: 'Delivery Date', component: DeliveryDateStep },
    { title: 'Order Review', component: OrderReviewStep },
    { title: 'Payment', component: PaymentStep },
  ];

  useEffect(() => {
    if (isOpen) {
      loadCheckoutData();
    }
  }, [isOpen]);

  const loadCheckoutData = async () => {
    setLoading(true);
    try {
      const { user } = (await supabase.auth.getSession()).data;
      if (user) {
        setUserId(user.id);
        const items = await cartService.getCart(user.id);
        setCartItems(items);
      }
    } catch (error) {
      console.error('Failed to load checkout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // Create order
      const order = await orderService.createOrder(
        userId,
        cartItems,
        selectedAddress,
        selectedZone,
        selectedDate,
        'stripe_payment_intent_id' // Placeholder
      );

      // Clear cart
      await cartService.clearCart(userId);

      alert(`Order created successfully! Order #${order.order_number}`);
      onClose();
      setCurrentStep(0);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 transform transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">Checkout</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <h3 className="text-lg font-semibold mb-4">{steps[currentStep].title}</h3>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <CurrentStepComponent
                cartItems={cartItems}
                selectedAddress={selectedAddress}
                onAddressChange={setSelectedAddress}
                selectedZone={selectedZone}
                onZoneChange={setSelectedZone}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                userId={userId}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-4 p-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-bold"
              >
                {loading ? 'Processing...' : 'Complete Order'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!selectedAddress && currentStep === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-bold"
              >
                Next
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
