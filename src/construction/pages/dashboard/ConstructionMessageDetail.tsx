import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link, useNavigate, useParams } from 'react-router-dom'

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
}

export default function ConstructionMessageDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const loadMessages = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/construction/login'
        return
      }

      const role = session.user.user_metadata?.role
      if (role !== 'construction_supplier') {
        await supabase.auth.updateUser({ data: { role: 'construction_supplier' } })
      }

      setSession(session)

      // Load messages
      const { data: messagesData } = await supabase
        .from('construction_messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      setMessages(messagesData || [])
      setLoading(false)
    }

    loadMessages()
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

      // Insert message
      const { error: messageError } = await supabase
        .from('construction_messages')
        .insert({
          conversation_id: id,
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
          <h2>Message Thread</h2>
          <Link to="/construction/dashboard/messages" style={{ padding: '10px 20px', background: '#666', color: 'white', textDecoration: 'none', borderRadius: 6 }}>
            Back to Messages
          </Link>
        </div>

        {/* Message Thread */}
        <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 8 }}>
          <div style={{ maxHeight: 500, overflowY: 'auto', marginBottom: 16 }}>
            {messages.length === 0 ? (
              <p style={{ color: '#666' }}>No messages yet. Start the conversation.</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} style={{ marginBottom: 12, padding: 12, background: 'white', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    {msg.sender_id === session?.user?.id ? 'You' : 'Buyer'} - {new Date(msg.created_at).toLocaleString()}
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
