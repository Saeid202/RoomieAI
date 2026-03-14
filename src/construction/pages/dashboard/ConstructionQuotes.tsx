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
        window.location.href = '/construction/login'
        return
      }

      const role = session.user.user_metadata?.role
      if (role !== 'construction_supplier') {
        await supabase.auth.signOut()
        window.location.href = '/construction/login'
        return
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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 250, background: '#1a2332', color: 'white', padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 40, fontSize: 18, fontWeight: 'bold' }}>HomieAI Construction</div>
        <nav style={{ flex: 1 }}>
          <Link to="/construction/dashboard" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none' }}>Home</Link>
          <Link to="/construction/dashboard/products" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Products</Link>
          <Link to="/construction/dashboard/quotes" style={{ display: 'block', padding: '12px 0', color: 'white', textDecoration: 'none', borderBottom: '2px solid #4a90e2', marginTop: 16 }}>Quotes</Link>
          <Link to="/construction/dashboard/messages" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Messages</Link>
          <Link to="/construction/dashboard/profile" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Profile</Link>
        </nav>
        <Link to="/construction/login" style={{ padding: '10px 16px', background: '#e05a5a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6, width: '100%', textAlign: 'center', textDecoration: 'none' }}>
          Logout
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2>Quotes</h2>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['all', 'pending', 'accepted', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              style={{
                padding: '8px 16px',
                background: filter === f ? '#4a90e2' : '#f5f5f5',
                color: filter === f ? 'white' : '#333',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 4
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {quotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: '#f5f5f5', borderRadius: 8 }}>
            <p style={{ color: '#666' }}>No quotes yet.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: 12 }}>Buyer</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Product</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Message</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Price</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Date</th>
                <th style={{ textAlign: 'left', padding: 12 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => (
                <tr key={quote.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12 }}>{quote.buyer_id}</td>
                  <td style={{ padding: 12 }}>{quote.construction_products?.title || 'Custom Quote'}</td>
                  <td style={{ padding: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {quote.message || '-'}
                  </td>
                  <td style={{ padding: 12 }}>{quote.total_price ? `$${quote.total_price}` : '-'}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      background: quote.status === 'pending' ? '#ff9800' : quote.status === 'accepted' ? '#4caf50' : '#e05a5a',
                      color: 'white'
                    }}>
                      {quote.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>{new Date(quote.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/construction/dashboard/quotes/${quote.id}`} style={{ padding: '4px 8px', background: '#4a90e2', color: 'white', textDecoration: 'none', borderRadius: 4, fontSize: 12 }}>
                        View
                      </Link>
                      {quote.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(quote.id, 'accepted')}
                            style={{ padding: '4px 8px', background: '#4caf50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: 12 }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(quote.id, 'rejected')}
                            style={{ padding: '4px 8px', background: '#e05a5a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: 12 }}
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
        )}
      </div>
    </div>
  )
}
