import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link, useNavigate, useParams } from 'react-router-dom'

interface Quote {
  id: string
  buyer_id: string
  product_id: string | null
  message: string | null
  status: string
  total_price: number | null
  created_at: string
  product: any
}

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
}

export default function ConstructionQuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const loadQuote = async () => {
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

      // Load quote
      const { data: quoteData } = await supabase
        .from('construction_quotes')
        .select(`
          *,
          construction_products ( title, description, price_cad, product_type, status )
        `)
        .eq('id', id)
        .single()

      if (!quoteData) {
        setError('Quote not found')
        return
      }

      setQuote(quoteData)

      // Load messages
      const { data: messagesData } = await supabase
        .from('construction_messages')
        .select('*')
        .eq('conversation_id', quoteData.id)
        .order('created_at', { ascending: true })

      setMessages(messagesData || [])

      setLoading(false)
    }

    loadQuote()
  }, [id])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/construction/login'
        return
      }

      // Create conversation if not exists
      const { data: conversation } = await supabase
        .from('construction_conversations')
        .upsert({
          product_id: quote?.product_id,
          buyer_id: quote?.buyer_id,
          supplier_id: session.user.id
        }, {
          onConflict: 'product_id,buyer_id,supplier_id'
        })
        .select()
        .single()

      // Insert message
      const { error: messageError } = await supabase
        .from('construction_messages')
        .insert({
          conversation_id: conversation?.id,
          sender_id: session.user.id,
          content: newMessage
        })

      if (messageError) throw new Error(messageError.message)

      setMessages([...messages, {
        id: Date.now().toString(),
        sender_id: session.user.id,
        content: newMessage,
        created_at: new Date().toISOString()
      }])

      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    }

    setSending(false)
  }

  const handleUpdateStatus = async (newStatus: string) => {
    await supabase
      .from('construction_quotes')
      .update({ status: newStatus })
      .eq('id', id)

    if (quote) {
      setQuote({ ...quote, status: newStatus })
    }
  }

  if (loading) {
    return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Loading...</div>
  }

  if (!quote) {
    return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Quote not found</div>
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
          <h2>Quote #{id}</h2>
          <Link to="/construction/dashboard/quotes" style={{ padding: '10px 20px', background: '#666', color: 'white', textDecoration: 'none', borderRadius: 6 }}>
            Back to Quotes
          </Link>
        </div>

        {/* Quote Details */}
        <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 8, marginBottom: 24 }}>
          <h3>Quote Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div>
              <strong>Buyer ID:</strong> {quote.buyer_id}
            </div>
            <div>
              <strong>Status:</strong>
              <span style={{
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                background: quote.status === 'pending' ? '#ff9800' : quote.status === 'accepted' ? '#4caf50' : '#e05a5a',
                color: 'white',
                marginLeft: 8
              }}>
                {quote.status}
              </span>
            </div>
            <div>
              <strong>Product:</strong> {quote.construction_products?.title || 'Custom Quote'}
            </div>
            <div>
              <strong>Price:</strong> ${quote.total_price || 'N/A'}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>Message:</strong> {quote.message || '-'}
            </div>
          </div>
        </div>

        {/* Product Details */}
        {quote.construction_products && (
          <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 8, marginBottom: 24 }}>
            <h3>Product Details</h3>
            <div style={{ marginTop: 16 }}>
              <p><strong>Title:</strong> {quote.construction_products.title}</p>
              <p><strong>Type:</strong> {quote.construction_products.product_type}</p>
              <p><strong>Price:</strong> ${quote.construction_products.price_cad}</p>
              <p><strong>Status:</strong> {quote.construction_products.status}</p>
              <p><strong>Description:</strong> {quote.construction_products.description}</p>
            </div>
          </div>
        )}

        {/* Status Actions */}
        {quote.status === 'pending' && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => handleUpdateStatus('accepted')}
              style={{ padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6 }}
            >
              Accept Quote
            </button>
            <button
              onClick={() => handleUpdateStatus('rejected')}
              style={{ padding: '10px 20px', background: '#e05a5a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6 }}
            >
              Reject Quote
            </button>
          </div>
        )}

        {/* Message Thread */}
        <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 8 }}>
          <h3>Message Thread</h3>
          <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
            {messages.length === 0 ? (
              <p style={{ color: '#666' }}>No messages yet. Start the conversation.</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} style={{ marginBottom: 12, padding: 12, background: 'white', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    {msg.sender_id === quote.buyer_id ? 'Buyer' : 'Supplier'} - {new Date(msg.created_at).toLocaleString()}
                  </div>
                  <div>{msg.content}</div>
                </div>
              ))
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, padding: 12, borderRadius: 6, border: '1px solid #ddd' }}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              style={{ padding: '10px 20px', background: '#4a90e2', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6 }}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
