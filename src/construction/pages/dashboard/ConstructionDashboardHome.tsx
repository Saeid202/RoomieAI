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
    let isMounted = true
    
    const loadDashboard = async () => {
      try {
        // Get current session from AuthProvider context instead of calling getSession()
        // This prevents additional auth state changes
        const { data: { session } } = await supabase.auth.getSession()

        if (!session || !isMounted) {
          if (isMounted) window.location.href = '/construction/login'
          return
        }

        // Set company name immediately
        setCompanyName(session.user.user_metadata?.company_name || 'Supplier')

        // Get supplier profile
        const { data: supplierProfile } = await supabase
          .from('construction_supplier_profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle()

        if (!supplierProfile || !isMounted) {
          if (isMounted) setLoading(false)
          return
        }

        // Load all stats in parallel
        const [products, quotes, messages] = await Promise.all([
          supabase.from('construction_products').select('id, status').eq('supplier_id', supplierProfile.id),
          supabase.from('construction_quotes').select('id, status').eq('supplier_id', supplierProfile.id),
          supabase.from('construction_messages').select('id', { count: 'exact', head: true })
        ])

        if (isMounted) {
          // Combine all stats updates into a single call to prevent multiple re-renders
          const newStats = {
            totalProducts: products.data ? products.data.length : 0,
            liveProducts: products.data ? products.data.filter(p => p.status === 'live').length : 0,
            pendingQuotes: quotes.data ? quotes.data.filter(q => q.status === 'pending').length : 0,
            totalMessages: messages.data ? messages.data.length : 0
          }
          setStats(newStats)
          setLoading(false)
        }
      } catch (error) {
        console.error('Dashboard load error:', error)
        if (isMounted) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/construction/login'
  }

  // Add CSS animation once - MUST BE BEFORE EARLY RETURN
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style')
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        fontFamily: 'Inter, sans-serif',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #FF6B35', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <div style={{ color: '#6b7280', fontSize: 16 }}>Loading Dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <div style={{ 
        width: 250, 
        background: 'linear-gradient(135deg, #1a1f2e 0%, #2d1b4e 100%)',
        color: 'white', 
        padding: 24, 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ marginBottom: 40, fontSize: 18, fontWeight: 'bold', background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>HomieAI Construction</div>
        <nav style={{ flex: 1 }}>
          <Link to="/construction/dashboard" style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none', borderLeft: '3px solid #FF6B35', paddingLeft: '13px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '0 8px 8px 0', marginBottom: 8, transition: 'all 0.3s ease' }}>Home</Link>
          <Link to="/construction/dashboard/products" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginTop: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Products</Link>
          <Link to="/construction/dashboard/quotes" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginTop: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Quotes</Link>
          <Link to="/construction/dashboard/messages" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginTop: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Messages</Link>
          <Link to="/construction/dashboard/profile" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginTop: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Profile</Link>
        </nav>
        <button
          onClick={handleLogout}
          style={{ 
            padding: '12px 16px', 
            background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
            color: 'white', 
            border: 'none', 
            cursor: 'pointer', 
            borderRadius: 8, 
            width: '100%',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)' }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1a1f2e', marginBottom: 8 }}>Welcome, {companyName}</h2>
          <p style={{ color: '#6b7280', fontSize: 16 }}>Manage your products, quotes, and customer interactions</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 40 }}>
          <div style={{ 
            background: 'white', 
            padding: 24, 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(255, 107, 53, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.15)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Products</div>
            <div style={{ fontSize: 32, fontWeight: 700, background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{stats.totalProducts}</div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: 24, 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.15)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Products</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>{stats.liveProducts}</div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: 24, 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(255, 107, 53, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.15)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Quotes</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b' }}>{stats.pendingQuotes}</div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: 24, 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.15)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Messages</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#3b82f6' }}>{stats.totalMessages}</div>
          </div>
        </div>

        {/* Recent Products */}
        <div style={{ background: 'white', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1f2e', marginBottom: 16 }}>Recent Products</h3>
          <p style={{ color: '#6b7280', fontSize: 15 }}>No products yet. <Link to="/construction/dashboard/products/new" style={{ color: '#FF6B35', fontWeight: 600, textDecoration: 'none', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#8B5CF6' }} onMouseLeave={(e) => { e.currentTarget.style.color = '#FF6B35' }}>Add your first product</Link></p>
        </div>
      </div>
    </div>
  )
}
