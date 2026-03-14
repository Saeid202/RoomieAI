import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link } from 'react-router-dom'

interface Product {
  id: string
  title: string
  status: string
  price_cad: number
  created_at: string
}

interface Quote {
  id: string
  status: string
  created_at: string
}

interface Message {
  id: string
  content: string
  created_at: string
}

interface Stats {
  totalProducts: number
  liveProducts: number
  pendingQuotes: number
  totalMessages: number
}

export default function ConstructionDashboardHome() {
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, liveProducts: 0, pendingQuotes: 0, totalMessages: 0 })

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/construction/login'
        return
      }

      const role = session.user.user_metadata?.role
      if (role !== 'construction_supplier') {
        await supabase.auth.signOut()
        window.location.href = '/construction/login'
        return
      }

      setCompanyName(session.user.user_metadata?.company_name || 'Supplier')

      // Load stats
      const { data: products } = await supabase
        .from('construction_products')
        .select('id, status')
        .eq('supplier_id', session.user.id)

      if (products) {
        const total = products.length
        const live = products.filter(p => p.status === 'live').length
        setStats(prev => ({ ...prev, totalProducts: total, liveProducts: live }))
      }

      const { data: quotes } = await supabase
        .from('construction_quotes')
        .select('id, status')
        .eq('supplier_id', session.user.id)

      if (quotes) {
        const pending = quotes.filter(q => q.status === 'pending').length
        setStats(prev => ({ ...prev, pendingQuotes: pending }))
      }

      const { data: messages } = await supabase
        .from('construction_messages')
        .select('id', { count: 'exact', head: true })

      if (messages) {
        setStats(prev => ({ ...prev, totalMessages: messages.length }))
      }

      setLoading(false)
    }

    loadDashboard()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/construction/login'
  }

  if (loading) {
    return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Loading...</div>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 250, background: '#1a2332', color: 'white', padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 40, fontSize: 18, fontWeight: 'bold' }}>HomieAI Construction</div>
        <nav style={{ flex: 1 }}>
          <Link to="/construction/dashboard" style={{ display: 'block', padding: '12px 0', color: 'white', textDecoration: 'none', borderBottom: '2px solid #4a90e2' }}>Home</Link>
          <Link to="/construction/dashboard/products" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Products</Link>
          <Link to="/construction/dashboard/quotes" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Quotes</Link>
          <Link to="/construction/dashboard/messages" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Messages</Link>
          <Link to="/construction/dashboard/profile" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Profile</Link>
        </nav>
        <button
          onClick={handleLogout}
          style={{ padding: '10px 16px', background: '#e05a5a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6, width: '100%' }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 40 }}>
        <h2>Welcome, {companyName}</h2>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
          <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Total Products</div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>{stats.totalProducts}</div>
          </div>
          <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Live Products</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#4caf50' }}>{stats.liveProducts}</div>
          </div>
          <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Pending Quotes</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ff9800' }}>{stats.pendingQuotes}</div>
          </div>
          <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Messages</div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>{stats.totalMessages}</div>
          </div>
        </div>

        {/* Recent Products */}
        <div>
          <h3>Recent Products</h3>
          <p style={{ color: '#666' }}>No products yet. <Link to="/construction/dashboard/products/new" style={{ color: '#4a90e2' }}>Add your first product</Link></p>
        </div>
      </div>
    </div>
  )
}
