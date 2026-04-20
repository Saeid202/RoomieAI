import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link } from 'react-router-dom'

interface Conversation {
  id: string
  product_id: string | null
  buyer_id: string
  supplier_id: string
  last_message_at: string | null
  created_at: string
  last_message: string | null
  product_title: string | null
}

export default function ConstructionMessages() {
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    const loadConversations = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/construction'
        return
      }

      const role = session.user.user_metadata?.role
      if (role !== 'construction_supplier') {
        await supabase.auth.updateUser({ data: { role: 'construction_supplier' } })
      }

      // Load conversations with last message
      const { data: conversationsData } = await supabase
        .from('construction_conversations')
        .select(`
          id,
          product_id,
          buyer_id,
          supplier_id,
          last_message_at,
          created_at,
          construction_messages ( content, created_at ) (limit=1,order=created_at.desc)
        `)
        .eq('supplier_id', session.user.id)
        .order('last_message_at', { ascending: false })

      if (conversationsData) {
        // Extract last message from each conversation
        const processed = conversationsData.map(conv => ({
          ...conv,
          last_message: conv.construction_messages?.[0]?.content || null
        }))
        setConversations(processed)
      }

      setLoading(false)
    }

    loadConversations()
  }, [])

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
          <Link to="/construction/dashboard/quotes" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Quotes</Link>
          <Link to="/construction/dashboard/messages" style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none', borderLeft: '3px solid #FF6B35', paddingLeft: '13px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '0 8px 8px 0', marginBottom: 8 }}>Messages</Link>
          <Link to="/construction/dashboard/profile" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Profile</Link>
        </nav>
        <Link to="/construction" onClick={async (e) => { e.preventDefault(); await supabase.auth.signOut(); window.location.href = '/construction' }} style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 8, width: '100%', textAlign: 'center', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)' }} onMouseEnter={(e) => { e.style.transform = 'translateY(-2px)'; e.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)' }} onMouseLeave={(e) => { e.style.transform = 'translateY(0)'; e.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)' }}>
          Logout
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1a1f2e', marginBottom: 8 }}>Messages</h2>
          <p style={{ color: '#6b7280', fontSize: 15 }}>Communicate with your customers</p>
        </div>

        {conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', fontSize: 16 }}>No messages yet. Start a conversation with a buyer.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {conversations.map(conv => (
              <Link
                key={conv.id}
                to={`/construction/dashboard/messages/${conv.id}`}
                style={{
                  padding: 20,
                  background: 'white',
                  borderRadius: 12,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#FF6B35' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e5e7eb' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: '#1a1f2e', fontSize: 16 }}>
                      {conv.product_title || 'Custom Conversation'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>
                      Buyer: {conv.buyer_id}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#6b7280', fontSize: 13 }}>
                      {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : 'No messages'}
                    </div>
                    {conv.last_message && (
                      <div style={{ color: '#1a1f2e', fontSize: 14, marginTop: 8, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {conv.last_message}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
