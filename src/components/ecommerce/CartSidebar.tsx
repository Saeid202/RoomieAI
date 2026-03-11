import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cartService } from '@/services/ecommerceService';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const { user } = (await supabase.auth.getSession()).data;
      if (user) {
        const items = await cartService.getCart(user.id);
        setCartItems(items);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const sum = cartItems.reduce((acc, item) => {
      return acc + (item.product?.price || 0) * item.quantity;
    }, 0);
    setTotal(sum);
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      const { user } = (await supabase.auth.getSession()).data;
      if (user) {
        if (quantity <= 0) {
          await cartService.removeFromCart(user.id, productId);
        } else {
          await cartService.updateCartQuantity(user.id, productId, quantity);
        }
        await loadCart();
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const { user } = (await supabase.auth.getSession()).data;
      if (user) {
        await cartService.removeFromCart(user.id, productId);
        await loadCart();
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCheckout = () => {
    onClose();
    onCheckout();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <p>Loading cart...</p>
            ) : cartItems.length === 0 ? (
              <p className="text-gray-600">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{item.product?.name}</h4>
                      <p className="text-blue-600 font-bold mb-2">
                        ${(item.product?.price || 0).toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                          className="px-2 py-1 border rounded hover:bg-gray-100"
                        >
                          −
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                          className="px-2 py-1 border rounded hover:bg-gray-100"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.product_id)}
                          className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
