import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import ConstructionHeader from '@/construction/components/ConstructionHeader'

export default function ConstructionLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) {
        setError(loginError.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('Login failed. Please try again.')
        setLoading(false)
        return
      }

      // Only redirect to supplier dashboard if they have a supplier profile
      const { data: supplierProfile } = await supabase
        .from('construction_supplier_profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (supplierProfile) {
        window.location.href = '/construction/dashboard'
      } else {
        window.location.href = '/construction'
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <ConstructionHeader />
      <div style={{ maxWidth: 400, margin: '100px auto', fontFamily: 'sans-serif' }}>
      <h2>Construction Supplier Login</h2>
      <form onSubmit={handleLogin}>
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
          <div style={{ position: 'relative', marginTop: 4 }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 8, paddingRight: 36, boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#666'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 10, background: '#1a2332', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <p style={{ marginTop: 16, textAlign: 'center' }}>
        No account? <Link to="/construction/signup">Sign up</Link>
      </p>
    </div>
    </>
  )
}
