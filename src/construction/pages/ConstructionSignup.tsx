import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link, useNavigate } from 'react-router-dom'
import ConstructionHeader from '@/construction/components/ConstructionHeader'

export default function ConstructionSignup() {
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(5)

  // Auto-redirect to login page after successful signup
  useEffect(() => {
    if (!success) return

    if (countdown <= 0) {
      navigate('/construction/login')
      return
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [success, countdown, navigate])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate inputs
      if (!companyName.trim() || !contactName.trim() || !email.trim() || !password.trim()) {
        setError('All fields are required.')
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        setLoading(false)
        return
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'construction_supplier',
            company_name: companyName.trim(),
            contact_name: contactName.trim()
          },
          emailRedirectTo: `${window.location.origin}/construction/login`
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('Signup failed. Please try again.')
        setLoading(false)
        return
      }

      // Verify the role was set
      if (data.user.user_metadata?.role !== 'construction_supplier') {
        console.warn('Role not set during signup, attempting to update...')
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: 'construction_supplier' }
        })
        if (updateError) {
          console.error('Failed to set role:', updateError)
        }
      }

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Signup error:', err)
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ maxWidth: 440, margin: '100px auto', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", padding: '0 20px' }}>
        <div style={{
          background: '#e8f5ee',
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 28
        }}>
          ✉️
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a2332', marginBottom: 12 }}>Check your email</h2>
        <p style={{ color: '#64748b', marginBottom: 8 }}>We sent a confirmation link to</p>
        <p style={{ fontWeight: 600, color: '#1a2332', marginBottom: 16 }}>{email}</p>
        <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
          Click the link to activate your account, then log in to access your dashboard.
        </p>
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
          Redirecting to login in <strong style={{ color: '#63c18a' }}>{countdown}</strong> second{countdown !== 1 ? 's' : ''}...
        </p>
        <button
          onClick={() => navigate('/construction/login')}
          style={{
            padding: '12px 32px',
            background: '#1a2332',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          Go to Login Now
        </button>
      </div>
    )
  }

  return (
    <>
      <ConstructionHeader />
      <div style={{ maxWidth: 400, margin: '100px auto', fontFamily: 'sans-serif' }}>
      <h2>Construction Supplier Sign Up</h2>
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: 12 }}>
          <label>Company Name</label><br />
          <input
            type="text"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Contact Name</label><br />
          <input
            type="text"
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 10, background: '#1a2332', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <p style={{ marginTop: 16, textAlign: 'center' }}>
        Already have an account? <Link to="/construction/login">Log in</Link>
      </p>
    </div>
    </>
  )
}
