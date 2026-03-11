import React, { useState, useEffect } from 'react';
import { ChevronDown, Package, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { orderService } from '@/services/ecommerceService';

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [order.id]);

  const loadOrderDetails = async () => {
    try {
      const data = await orderService.getOrderDetails(order.id);
      setDetails(data);
    } catch (error) {
      console.error('Failed to load order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <p>Failed to load order details</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Order {details.order_number}</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="space-y-2">
              {details.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product?.name} x {item.quantity}</span>
                  <span>${item.total_price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${details.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax:</span>
              <span>${details.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Delivery Fee:</span>
              <span>${details.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${details.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Status History</h3>
            <div className="space-y-2">
              {details.status_history?.map((history: any) => (
                <div key={history.id} className="text-sm">
                  <div className="font-medium">{history.status}</div>
                  <div className="text-gray-600">{history.notes}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(history.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { user } = (await supabase.auth.getSession()).data;
      if (user) {
        const data = await orderService.getOrders(user.id);
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
            <a
              href="/dashboard/homiestore"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{order.order_number}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} />
                        ${order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details
                  <ChevronDown size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
