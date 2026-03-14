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
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h2>Profile Updated</h2>
        <p>Your profile has been successfully updated.</p>
        <Link to="/construction/dashboard" style={{ padding: '10px 20px', background: '#4a90e2', color: 'white', textDecoration: 'none', borderRadius: 6, marginTop: 16, display: 'inline-block' }}>
          Back to Dashboard
        </Link>
      </div>
    )
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
          <Link to="/construction/dashboard/messages" style={{ display: 'block', padding: '12px 0', color: '#aaa', textDecoration: 'none', marginTop: 16 }}>Messages</Link>
          <Link to="/construction/dashboard/profile" style={{ display: 'block', padding: '12px 0', color: 'white', textDecoration: 'none', borderBottom: '2px solid #4a90e2', marginTop: 16 }}>Profile</Link>
        </nav>
        <Link to="/construction/login" style={{ padding: '10px 16px', background: '#e05a5a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6, width: '100%', textAlign: 'center', textDecoration: 'none' }}>
          Logout
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 40 }}>
        <h2>Supplier Profile</h2>

        {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

        <div style={{ maxWidth: 500, marginTop: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label>Company Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
              style={{ width: '100%', padding: 12, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Contact Name *</label>
            <input
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              required
              style={{ width: '100%', padding: 12, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Email (Read Only)</label>
            <input
              type="email"
              value={email}
              disabled
              style={{ width: '100%', padding: 12, marginTop: 4, background: '#f5f5f5' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', padding: 12, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Country</label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              style={{ width: '100%', padding: 12, marginTop: 4 }}
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
            style={{ padding: '12px 24px', background: '#4a90e2', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 6 }}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
