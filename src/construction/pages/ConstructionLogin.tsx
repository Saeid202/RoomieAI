import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client-simple'
import { Link } from 'react-router-dom'
import ConstructionHeader from '@/construction/components/ConstructionHeader'

export default function ConstructionLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

      // Get fresh user data to ensure metadata is loaded
      const { data: { user: freshUser }, error: refreshError } = await supabase.auth.getUser()
      
      if (refreshError || !freshUser) {
        setError('Failed to verify account. Please try again.')
        setLoading(false)
        return
      }

      const role = freshUser.user_metadata?.role
      
      if (role !== 'construction_supplier') {
        console.error('Invalid role:', role, 'User metadata:', freshUser.user_metadata)
        
        // Try to fix the role if it's missing
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: 'construction_supplier' }
        })

        if (updateError) {
          await supabase.auth.signOut()
          setError('Account verification failed. Please sign up again.')
          setLoading(false)
          return
        }

        // Retry with updated metadata
        const { data: { user: updatedUser } } = await supabase.auth.getUser()
        if (updatedUser?.user_metadata?.role === 'construction_supplier') {
          window.location.href = '/construction/dashboard'
          return
        }

        await supabase.auth.signOut()
        setError('You do not have access to this portal. Please sign up as a construction supplier.')
        setLoading(false)
        return
      }

      window.location.href = '/construction/dashboard'
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
