import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client-simple'
import ConstructionHeader from '@/construction/components/ConstructionHeader'

const STATUS_COLORS: Record<string, string> = {
  pending_payment: '#f59e0b',
  paid: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
  refunded: '#6b7280'
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending Payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded'
}

export default function BuyerOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/construction'); return }

      const { data } = await supabase
        .from('construction_orders')
        .select(`
          id, status, total_cad, quantity, delivery_address, created_at,
          construction_products ( id, title, product_type, price_cad )
        `)
        .eq('buyer_id', session.user.id)
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <ConstructionHeader />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <Link to="/construction"
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors">
              Continue Shopping
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <p className="text-gray-400 text-lg mb-4">No orders yet</p>
              <Link to="/construction"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors inline-block">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {order.construction_products?.title || 'Product'}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {order.construction_products?.product_type} · Qty: {order.quantity}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: STATUS_COLORS[order.status] || '#6b7280' }}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">Order Total</p>
                      <p className="font-semibold text-gray-900">${order.total_cad?.toLocaleString()} CAD</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Order Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(order.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Deliver To</p>
                      <p className="font-semibold text-gray-900">
                        {order.delivery_address?.city}, {order.delivery_address?.province}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Order ID</p>
                      <p className="font-mono text-xs text-gray-500">{order.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
