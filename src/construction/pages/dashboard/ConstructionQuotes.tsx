import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link } from 'react-router-dom'

interface Quote {
  id: string
  buyer_id: string
  product_id: string | null
  message: string | null
  status: string
  total_price: number | null
  created_at: string
  buyer_email: string
  product_title: string | null
}

export default function ConstructionQuotes() {
  const [loading, setLoading] = useState(true)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')

  useEffect(() => {
    const loadQuotes = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/construction'
        return
      }

      const role = session.user.user_metadata?.role
      if (role !== 'construction_supplier') {
        await supabase.auth.updateUser({ data: { role: 'construction_supplier' } })
      }

      let query = supabase
        .from('construction_quotes')
        .select(`
          id,
          buyer_id,
          product_id,
          message,
          status,
          total_price,
          created_at,
          construction_products ( title )
        `)
        .eq('supplier_id', session.user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data } = await query

      if (data) {
        setQuotes(data)
      }

      setLoading(false)
    }

    loadQuotes()
  }, [filter])

  const handleUpdateStatus = async (quoteId: string, newStatus: string) => {
    await supabase
      .from('construction_quotes')
      .update({ status: newStatus })
      .eq('id', quoteId)

    setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status: newStatus } : q))
  }

  if (loading) {
    return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Loading...</div>
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
          <Link to="/construction/dashboard" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Home</Link>
          <Link to="/construction/dashboard/products" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Products</Link>
          <Link to="/construction/dashboard/quotes" style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none', borderLeft: '3px solid #FF6B35', paddingLeft: '13px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '0 8px 8px 0', marginBottom: 8 }}>Quotes</Link>
          <Link to="/construction/dashboard/messages" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Messages</Link>
          <Link to="/construction/dashboard/profile" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Profile</Link>
        </nav>
        <Link to="/construction" onClick={async (e) => { e.preventDefault(); await supabase.auth.signOut(); window.location.href = '/construction' }} style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 8, width: '100%', textAlign: 'center', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)' }} onMouseEnter={(e) => { e.style.transform = 'translateY(-2px)'; e.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)' }} onMouseLeave={(e) => { e.style.transform = 'translateY(0)'; e.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)' }}>
          Logout
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1a1f2e', marginBottom: 8 }}>Quotes</h2>
          <p style={{ color: '#6b7280', fontSize: 15 }}>Manage customer quote requests</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
          {['all', 'pending', 'accepted', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              style={{
                padding: '8px 16px',
                background: filter === f ? 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)' : 'transparent',
                color: filter === f ? 'white' : '#6b7280',
                border: filter === f ? 'none' : '1px solid #e5e7eb',
                cursor: 'pointer',
                borderRadius: 6,
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { if (filter !== f) { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.color = '#FF6B35' } }}
              onMouseLeave={(e) => { if (filter !== f) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' } }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {quotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', fontSize: 16 }}>No quotes yet. Quotes from customers will appear here.</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Buyer</th>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Product</th>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Message</th>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Price</th>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Date</th>
                  <th style={{ textAlign: 'left', padding: 16, fontWeight: 700, color: '#1a1f2e', fontSize: 14 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map(quote => (
                  <tr key={quote.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 107, 53, 0.02)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                    <td style={{ padding: 16, color: '#1a1f2e', fontWeight: 500 }}>{quote.buyer_id}</td>
                    <td style={{ padding: 16, color: '#1a1f2e', fontWeight: 500 }}>{quote.construction_products?.title || 'Custom Quote'}</td>
                    <td style={{ padding: 16, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', color: '#6b7280', fontSize: 14 }}>
                      {quote.message || '-'}
                    </td>
                    <td style={{ padding: 16, color: '#1a1f2e', fontWeight: 600 }}>{quote.total_price ? `$${quote.total_price.toLocaleString()}` : '-'}</td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        background: quote.status === 'pending' ? '#f59e0b' : quote.status === 'accepted' ? '#10b981' : '#ef4444',
                        color: 'white',
                        fontWeight: 600
                      }}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>{new Date(quote.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/construction/dashboard/quotes/${quote.id}`} style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: 'white', textDecoration: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 2px 6px rgba(139, 92, 246, 0.2)' }} onMouseEnter={(e) => { e.style.transform = 'translateY(-1px)'; e.style.boxShadow = '0 4px 10px rgba(139, 92, 246, 0.3)' }} onMouseLeave={(e) => { e.style.transform = 'translateY(0)'; e.style.boxShadow = '0 2px 6px rgba(139, 92, 246, 0.2)' }}>
                          View
                        </Link>
                        {quote.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(quote.id, 'accepted')}
                              style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6, fontSize: 12, fontWeight: 600, transition: 'all 0.3s ease' }}
                              onMouseEnter={(e) => { e.style.background = '#059669'; e.style.transform = 'translateY(-1px)' }}
                              onMouseLeave={(e) => { e.style.background = '#10b981'; e.style.transform = 'translateY(0)' }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(quote.id, 'rejected')}
                              style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6, fontSize: 12, fontWeight: 600, transition: 'all 0.3s ease' }}
                              onMouseEnter={(e) => { e.style.background = '#dc2626'; e.style.transform = 'translateY(-1px)' }}
                              onMouseLeave={(e) => { e.style.background = '#ef4444'; e.style.transform = 'translateY(0)' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
