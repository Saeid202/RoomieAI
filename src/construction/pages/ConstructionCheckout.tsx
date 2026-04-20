import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '@/integrations/supabase/client-simple'
import ConstructionHeader from '@/construction/components/ConstructionHeader'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

interface DeliveryAddress {
  full_name: string
  street: string
  city: string
  province: string
  postal_code: string
  country: string
  phone: string
}

interface CheckoutFormProps {
  product: any
  onSuccess: (orderId: string) => void
}

function CheckoutForm({ product, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [address, setAddress] = useState<DeliveryAddress>({
    full_name: '', street: '', city: '', province: '', postal_code: '', country: 'Canada', phone: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setError('')
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError('Please log in to continue.'); setLoading(false); return }

      // Create payment intent via edge function
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-construction-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          supplier_id: product.supplier_id,
          quantity: 1,
          delivery_address: address,
          amount_cad: product.price_cad
        })
      })

      const { client_secret, order_id, error: fnError } = await res.json()
      if (fnError) throw new Error(fnError)

      // Confirm card payment
      const cardElement = elements.getElement(CardElement)!
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: { card: cardElement }
      })

      if (stripeError) throw new Error(stripeError.message)
      if (paymentIntent?.status === 'succeeded') {
        // Update order status
        await supabase.from('construction_orders').update({ status: 'paid' }).eq('id', order_id)
        onSuccess(order_id)
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.')
    }
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Delivery Address */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h3>
        <div className="space-y-3">
          <input type="text" placeholder="Full Name *" required value={address.full_name}
            onChange={e => setAddress(p => ({ ...p, full_name: e.target.value }))} className={inputClass} />
          <input type="text" placeholder="Street Address *" required value={address.street}
            onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="City *" required value={address.city}
              onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} className={inputClass} />
            <input type="text" placeholder="Province *" required value={address.province}
              onChange={e => setAddress(p => ({ ...p, province: e.target.value }))} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Postal Code *" required value={address.postal_code}
              onChange={e => setAddress(p => ({ ...p, postal_code: e.target.value }))} className={inputClass} />
            <input type="text" placeholder="Phone *" required value={address.phone}
              onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment</h3>
        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
          <CardElement options={{
            style: {
              base: { fontSize: '16px', color: '#1a1f2e', '::placeholder': { color: '#9ca3af' } }
            }
          }} />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" disabled={loading || !stripe}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50">
        {loading ? 'Processing...' : `Pay $${product.price_cad?.toLocaleString()} CAD`}
      </button>
    </form>
  )
}

export default function ConstructionCheckout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const product = location.state?.product

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/construction'); return }
      setUser(session.user)
    })
  }, [navigate])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No product selected. <a href="/construction" className="text-orange-500 underline">Browse products</a></p>
      </div>
    )
  }

  if (orderId) {
    return (
      <>
        <ConstructionHeader />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Order Confirmed!</h2>
            <p className="text-gray-500 mb-2">Your order has been placed successfully.</p>
            <p className="text-sm text-gray-400 mb-8">Order ID: <span className="font-mono text-gray-600">{orderId}</span></p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/construction/buyer/orders')}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
                View My Orders
              </button>
              <button onClick={() => navigate('/construction')}
                className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ConstructionHeader />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <Elements stripe={stripePromise}>
                <CheckoutForm product={product} onSuccess={setOrderId} />
              </Elements>
            </div>

            {/* Right: Order Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              {product.image_url && (
                <img src={product.image_url} alt={product.title}
                  className="w-full h-40 object-cover rounded-xl mb-4" />
              )}
              <p className="font-semibold text-gray-900 mb-1">{product.title}</p>
              <p className="text-sm text-gray-500 mb-4">{product.product_type}</p>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${product.price_cad?.toLocaleString()} CAD</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">TBD by supplier</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>${product.price_cad?.toLocaleString()} CAD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
