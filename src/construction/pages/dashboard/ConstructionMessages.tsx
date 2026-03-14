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
        window.location.href = '/construction/login'
        return
      }

      const role = session.user.user_metadata?.role
      if (role !== 'construction_supplier') {
        await supabase.auth.signOut()
        window.location.href = '/construction/login'
        return
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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 250, background: '#1a2332', color: 'white', padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 40, fontSize: 18, fontWeight: 'bold' }}>HomieAI Construction</div>
        <nav style={{ flex: 1 }}>
          <Link to="/construction/dashboard" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none' }}>Home</Link>
          <Link to="/construction/dashboard/products" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Products</Link>
          <Link to="/construction/dashboard/quotes" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Quotes</Link>
          <Link to="/construction/dashboard/messages" style={{ display: 'block', padding: '12px 0', color: 'white', textDecoration: 'none', borderBottom: '2px solid #4a90e2', marginTop: 16 }}>Messages</Link>
          <Link to="/construction/dashboard/profile" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Profile</Link>
        </nav>
        <Link to="/construction/login" style={{ padding: '10px 16px', background: '#e05a5a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6, width: '100%', textAlign: 'center', textDecoration: 'none' }}>
          Logout
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2>Messages</h2>
        </div>

        {conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: '#f5f5f5', borderRadius: 8 }}>
            <p style={{ color: '#666' }}>No messages yet. Start a conversation with a buyer.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {conversations.map(conv => (
              <Link
                key={conv.id}
                to={`/construction/dashboard/messages/${conv.id}`}
                style={{
                  padding: 16,
                  background: 'white',
                  borderRadius: 8,
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                      {conv.product_title || 'Custom Conversation'}
                    </div>
                    <div style={{ color: '#666', fontSize: 14 }}>
                      Buyer: {conv.buyer_id}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#666', fontSize: 12 }}>
                      {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : 'No messages'}
                    </div>
                    {conv.last_message && (
                      <div style={{ color: '#333', fontSize: 14, marginTop: 4, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
