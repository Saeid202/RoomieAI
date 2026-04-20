import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/integrations/supabase/client-simple'
import { X, Eye, EyeOff, Home } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'signup'
}

// Homie AI flow steps
type HomieStep = 'idle' | 'email' | 'confirm' | 'authorize'

interface HomieProfile {
  id: string
  full_name: string
  email: string
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup state
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  // Homie AI flow state
  const [homieStep, setHomieStep] = useState<HomieStep>('idle')
  const [homieEmail, setHomieEmail] = useState('')
  const [homieProfile, setHomieProfile] = useState<HomieProfile | null>(null)
  const [homieCompany, setHomieCompany] = useState('')
  const [homiePassword, setHomiePassword] = useState('')
  const [showHomiePassword, setShowHomiePassword] = useState(false)
  const [homieLoading, setHomieLoading] = useState(false)
  const [homieError, setHomieError] = useState('')

  if (!isOpen) return null

  const resetHomieFlow = () => {
    setHomieStep('idle')
    setHomieEmail('')
    setHomieProfile(null)
    setHomieCompany('')
    setHomiePassword('')
    setHomieError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      })
      if (loginError) { setError(loginError.message); setLoading(false); return }
      if (!data.user) { setError('Login failed. Please try again.'); setLoading(false); return }
      window.location.href = '/construction/dashboard'
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!companyName.trim() || !contactName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
        setError('All fields are required.'); setLoading(false); return
      }
      if (signupPassword.length < 6) {
        setError('Password must be at least 6 characters.'); setLoading(false); return
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: { role: 'construction_supplier', company_name: companyName.trim(), contact_name: contactName.trim() },
          emailRedirectTo: `${window.location.origin}/construction`
        }
      })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      if (!data.user) { setError('Signup failed. Please try again.'); setLoading(false); return }
      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Signup error:', err)
    }
    setLoading(false)
  }

  // Step 2: Look up email in user_profiles
  const handleHomieEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setHomieError('')
    setHomieLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('email', homieEmail.trim().toLowerCase())
        .maybeSingle()

      if (error) throw error

      if (!data) {
        setHomieError('No Homie AI account found with this email.')
        setHomieLoading(false)
        return
      }

      setHomieProfile(data)
      setHomieStep('confirm')
    } catch {
      setHomieError('Something went wrong. Please try again.')
    }
    setHomieLoading(false)
  }

  // Step 4: Verify password + create supplier profile
  const handleHomieAuthorize = async (e: React.FormEvent) => {
    e.preventDefault()
    setHomieError('')
    if (!homieCompany.trim()) { setHomieError('Company name is required.'); return }
    if (!homiePassword) { setHomieError('Password is required.'); return }
    setHomieLoading(true)
    try {
      // Verify ownership via password
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: homieProfile!.email,
        password: homiePassword
      })
      if (authError || !data.user) {
        setHomieError('Incorrect password. Please try again.')
        setHomieLoading(false)
        return
      }

      // Update role metadata
      await supabase.auth.updateUser({
        data: {
          role: 'construction_supplier',
          company_name: homieCompany.trim(),
          contact_name: homieProfile!.full_name
        }
      })

      // Create supplier profile
      const { error: profileError } = await supabase
        .from('construction_supplier_profiles')
        .upsert({
          id: data.user.id,
          user_id: data.user.id,
          company_name: homieCompany.trim(),
          contact_name: homieProfile!.full_name,
          email: homieProfile!.email,
          phone: '',
          verified: false
        }, { onConflict: 'id' })

      if (profileError) throw profileError

      window.location.href = '/construction/dashboard'
    } catch (err: any) {
      setHomieError(err.message || 'Something went wrong. Please try again.')
    }
    setHomieLoading(false)
  }

  if (success) {
    return createPortal(
      <div className="fixed inset-0 flex items-center justify-center bg-black/40" style={{ zIndex: 99999 }} onClick={onClose}>
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative shadow-2xl" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✉️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 mb-2">We sent a confirmation link to</p>
            <p className="font-semibold text-gray-900 mb-4">{signupEmail}</p>
            <p className="text-gray-500 text-sm mb-6">Click the link to activate your account, then log in.</p>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/40" style={{ zIndex: 99999 }} onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 relative shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${activeTab === 'login' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => { setActiveTab('login'); resetHomieFlow() }}
          >Log In</button>
          <button
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${activeTab === 'signup' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => { setActiveTab('signup'); resetHomieFlow() }}
          >Sign Up</button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

        {/* ── LOGIN TAB ── */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your email" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 pr-12"
                  placeholder="Enter your password" />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 text-base bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        )}

        {/* ── SIGNUP TAB ── */}
        {activeTab === 'signup' && (
          <div className="space-y-4">

            {/* Step 2: Email input */}
            {homieStep === 'email' && (
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-purple-700">Enter your Homie AI email</p>
                  <button type="button" onClick={resetHomieFlow} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                {homieError && <p className="text-red-500 text-xs mb-2">{homieError}</p>}
                <form onSubmit={handleHomieEmailCheck} className="space-y-2">
                  <input type="email" value={homieEmail} onChange={e => setHomieEmail(e.target.value)} required
                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                    placeholder="your@email.com" autoFocus />
                  <button type="submit" disabled={homieLoading}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                    {homieLoading ? 'Checking...' : 'Check Account'}
                  </button>
                </form>
              </div>
            )}

            {/* Step 3: Confirm account */}
            {homieStep === 'confirm' && homieProfile && (
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide">Homie AI account found</p>
                  <button type="button" onClick={resetHomieFlow} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg border border-purple-100">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {homieProfile.full_name?.[0]?.toUpperCase() || homieProfile.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{homieProfile.full_name || 'Homie AI User'}</p>
                    <p className="text-xs text-gray-500">{homieProfile.email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-3">Do you want to use this account to register as a construction supplier?</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setHomieStep('authorize')}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    Yes, use this account
                  </button>
                  <button type="button" onClick={resetHomieFlow}
                    className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Company name + password confirmation */}
            {homieStep === 'authorize' && homieProfile && (
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide">Complete registration</p>
                  <button type="button" onClick={resetHomieFlow} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                <div className="flex items-center gap-2 mb-4 p-2 bg-white rounded-lg border border-purple-100">
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {homieProfile.full_name?.[0]?.toUpperCase() || homieProfile.email[0].toUpperCase()}
                  </div>
                  <p className="text-xs text-gray-600">{homieProfile.email}</p>
                </div>
                {homieError && <p className="text-red-500 text-xs mb-2">{homieError}</p>}
                <form onSubmit={handleHomieAuthorize} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
                    <input type="text" value={homieCompany} onChange={e => setHomieCompany(e.target.value)} required
                      className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                      placeholder="Your company name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Confirm your Homie AI password *</label>
                    <div className="relative">
                      <input type={showHomiePassword ? 'text' : 'password'} value={homiePassword} onChange={e => setHomiePassword(e.target.value)} required
                        className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white pr-9"
                        placeholder="Enter your password" />
                      <button type="button" onClick={() => setShowHomiePassword(!showHomiePassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showHomiePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={homieLoading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                    {homieLoading ? 'Setting up...' : '🏠 Complete Registration'}
                  </button>
                </form>
              </div>
            )}

            {/* Divider — only show when Homie flow is idle */}
            {homieStep === 'idle' && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}

            {/* Regular signup form — hidden when Homie flow is active */}
            {homieStep === 'idle' && (
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter company name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Name</label>
                  <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} required
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter contact name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showSignupPassword ? 'text' : 'password'} value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required
                      className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 pr-12"
                      placeholder="Create a password (min 6 characters)" />
                    <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showSignupPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 text-base bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {loading ? 'Creating account...' : 'Sign Up'}
                </button>
              </form>
            )}

            {/* Divider + Homie AI button — at the bottom, only when flow is idle */}
            {homieStep === 'idle' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <button
                  type="button"
                  onClick={() => setHomieStep('email')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 font-semibold rounded-lg transition-colors text-sm"
                >
                  <Home size={16} />
                  Sign up with Homie AI
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
