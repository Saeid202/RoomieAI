import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link } from 'react-router-dom'

export default function ConstructionProfile() {
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('China')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
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

      setEmail(session.user.email)

      const { data: profile } = await supabase
        .from('construction_supplier_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setCompanyName(profile.company_name)
        setContactName(profile.contact_name)
        setPhone(profile.phone || '')
        setCountry(profile.country || 'China')
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleSave = async () => {
    setError('')
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/construction/login'
        return
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('construction_supplier_profiles')
        .update({
          company_name: companyName,
          contact_name: contactName,
          phone,
          country
        })
        .eq('id', session.user.id)

      if (profileError) throw new Error(profileError.message)

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          company_name: companyName,
          contact_name: contactName
        }
      })

      if (metadataError) throw new Error(metadataError.message)

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }

    setLoading(false)
  }

  if (loading) {
    return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Loading...</div>
  }

  if (success) {
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
        </div>
        <div style={{ flex: 1, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: 40, borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', textAlign: 'center', maxWidth: 400 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1f2e', marginBottom: 12 }}>Profile Updated</h2>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>Your profile has been successfully updated.</p>
            <Link to="/construction/dashboard" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)', color: 'white', textDecoration: 'none', borderRadius: 8, display: 'inline-block', fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)' }} onMouseEnter={(e) => { e.style.transform = 'translateY(-2px)'; e.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)' }} onMouseLeave={(e) => { e.style.transform = 'translateY(0)'; e.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)' }}>
              Back to Dashboard
            </Link>
          </div>
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
          <Link to="/construction/dashboard" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Home</Link>
          <Link to="/construction/dashboard/products" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Products</Link>
          <Link to="/construction/dashboard/quotes" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Quotes</Link>
          <Link to="/construction/dashboard/messages" style={{ display: 'block', padding: '12px 16px', color: '#b0b8c1', textDecoration: 'none', marginBottom: 8, borderRadius: 8, transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b8c1' }}>Messages</Link>
          <Link to="/construction/dashboard/profile" style={{ display: 'block', padding: '12px 16px', color: 'white', textDecoration: 'none', borderLeft: '3px solid #FF6B35', paddingLeft: '13px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '0 8px 8px 0', marginBottom: 8 }}>Profile</Link>
        </nav>
        <Link to="/construction/login" style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 8, width: '100%', textAlign: 'center', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)' }} onMouseEnter={(e) => { e.style.transform = 'translateY(-2px)'; e.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)' }} onMouseLeave={(e) => { e.style.transform = 'translateY(0)'; e.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)' }}>
          Logout
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1a1f2e', marginBottom: 8 }}>Supplier Profile</h2>
          <p style={{ color: '#6b7280', fontSize: 15 }}>Manage your company information</p>
        </div>

        {error && <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: 16, borderRadius: 8, marginBottom: 24 }}>{error}</div>}

        <div style={{ background: 'white', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', maxWidth: 600 }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>Company Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
              style={{ width: '100%', padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 15, fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>Contact Name *</label>
            <input
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              required
              style={{ width: '100%', padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 15, fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>Email (Read Only)</label>
            <input
              type="email"
              value={email}
              disabled
              style={{ width: '100%', padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 15, fontFamily: 'Inter, sans-serif', background: '#f9fafb', color: '#6b7280' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 15, fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#1a1f2e', marginBottom: 8 }}>Country</label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              style={{ width: '100%', padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 15, fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <option value="China">China</option>
              <option value="USA">USA</option>
              <option value="Canada">Canada</option>
              <option value="UK">UK</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{ 
              padding: '12px 32px', 
              background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)',
              color: 'white', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              borderRadius: 8,
              fontWeight: 600,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)' } }}
            onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)' } }}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
