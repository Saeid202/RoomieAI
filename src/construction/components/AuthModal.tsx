import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/integrations/supabase/client-simple'
import { X, Eye, EyeOff, Home } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'signup'
}

type HomieStep = 'idle' | 'email' | 'confirm' | 'authorize'

interface HomieProfile {
  id: string
  full_name: string
  email: string
}

const inputCls = 'w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500'
const purpleInputCls = 'w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white'

// ── Reusable Homie AI flow component ──────────────────────────────────────────
function HomieFlow({
  role,
  onSuccess,
  onCancel,
}: {
  role: 'buyer' | 'supplier'
  onSuccess: () => void
  onCancel: () => void
}) {
  const [step, setStep] = useState<HomieStep>('email')
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<HomieProfile | null>(null)
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()
    setLoading(false)
    if (!data) { setError('No Homie AI account found with this email.'); return }
    setProfile(data)
    setStep('confirm')
  }

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (role === 'supplier' && !company.trim()) { setError('Company name is required.'); return }
    setLoading(true)
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: profile!.email,
        password
      })
      if (authErr || !data.user) { setError('Incorrect password. Please try again.'); setLoading(false); return }

      if (role === 'supplier') {
        await supabase.auth.updateUser({
          data: { role: 'construction_supplier', company_name: company.trim(), contact_name: profile!.full_name }
        })
        await supabase.from('construction_supplier_profiles').upsert({
          id: data.user.id, user_id: data.user.id,
          company_name: company.trim(), contact_name: profile!.full_name,
          email: profile!.email, phone: '', verified: false
        }, { onConflict: 'id' })
      } else {
        // Buyer — don't touch Homie AI role, just create buyer profile
        await supabase.from('construction_buyer_profiles').upsert({
          id: data.user.id, email: profile!.email,
          full_name: profile!.full_name
        }, { onConflict: 'id' })
      }
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
          {step === 'email' ? 'Enter your Homie AI email'
            : step === 'confirm' ? 'Account found'
            : 'Confirm & complete'}
        </p>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>

      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

      {/* Step 1: Email */}
      {step === 'email' && (
        <form onSubmit={handleEmailCheck} className="space-y-2">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className={purpleInputCls} placeholder="your@email.com" autoFocus />
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Checking...' : 'Check Account'}
          </button>
        </form>
      )}

      {/* Step 2: Confirm */}
      {step === 'confirm' && profile && (
        <>
          <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg border border-purple-100">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{profile.full_name || 'Homie AI User'}</p>
              <p className="text-xs text-gray-500">{profile.email}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Use this account to register as a construction {role}?
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep('authorize')}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Yes, continue
            </button>
            <button type="button" onClick={onCancel}
              className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Step 3: Authorize */}
      {step === 'authorize' && profile && (
        <form onSubmit={handleAuthorize} className="space-y-3">
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-100 mb-1">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
            </div>
            <p className="text-xs text-gray-600">{profile.email}</p>
          </div>
          {role === 'supplier' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} required
                className={purpleInputCls} placeholder="Your company name" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirm your Homie AI password *</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                className={`${purpleInputCls} pr-9`} placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Setting up...' : `🏠 Complete as ${role === 'buyer' ? 'Buyer' : 'Supplier'}`}
          </button>
        </form>
      )}
    </div>
  )
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showLoginPw, setShowLoginPw] = useState(false)
  const [showSignupPw, setShowSignupPw] = useState(false)

  // Role selection
  const [signupRole, setSignupRole] = useState<'buyer' | 'supplier' | null>(null)
  // Which method: 'form' | 'homie'
  const [signupMethod, setSignupMethod] = useState<'form' | 'homie' | null>(null)

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Login with Homie AI state
  const [loginHomieStep, setLoginHomieStep] = useState<'idle' | 'email' | 'confirm' | 'password'>('idle')
  const [loginHomieEmail, setLoginHomieEmail] = useState('')
  const [loginHomieProfile, setLoginHomieProfile] = useState<HomieProfile | null>(null)
  const [loginHomiePassword, setLoginHomiePassword] = useState('')
  const [showLoginHomiePw, setShowLoginHomiePw] = useState(false)
  const [loginHomieLoading, setLoginHomieLoading] = useState(false)
  const [loginHomieError, setLoginHomieError] = useState('')

  const resetLoginHomie = () => {
    setLoginHomieStep('idle')
    setLoginHomieEmail('')
    setLoginHomieProfile(null)
    setLoginHomiePassword('')
    setLoginHomieError('')
  }

  // Signup form fields
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')

  if (!isOpen) return null

  const resetSignup = () => {
    setSignupRole(null)
    setSignupMethod(null)
    setSignupName(''); setSignupEmail(''); setSignupPassword('')
    setCompanyName(''); setContactName('')
    setError('')
  }

  // Smart login redirect based on construction profile
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail, password: loginPassword
      })
      if (loginError) { setError(loginError.message); setLoading(false); return }
      if (!data.user) { setError('Login failed. Please try again.'); setLoading(false); return }

      // Only go to supplier dashboard if explicitly registered as supplier
      // Everyone else defaults to /construction (buyer)
      const { data: supplier } = await supabase
        .from('construction_supplier_profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (supplier) {
        window.location.href = '/construction/dashboard'
      } else {
        window.location.href = '/construction'
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleLoginHomieEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginHomieError('')
    setLoginHomieLoading(true)
    const { data } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('email', loginHomieEmail.trim().toLowerCase())
      .maybeSingle()
    setLoginHomieLoading(false)
    if (!data) { setLoginHomieError('No Homie AI account found with this email.'); return }
    setLoginHomieProfile(data)
    setLoginHomieStep('confirm')
  }

  const handleLoginHomiePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginHomieError('')
    setLoginHomieLoading(true)
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: loginHomieProfile!.email,
        password: loginHomiePassword
      })
      if (authErr || !data.user) { setLoginHomieError('Incorrect password. Please try again.'); setLoginHomieLoading(false); return }

      const { data: supplier } = await supabase
        .from('construction_supplier_profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (supplier) {
        window.location.href = '/construction/dashboard'
      } else {
        window.location.href = '/construction'
      }
    } catch {
      setLoginHomieError('Something went wrong. Please try again.')
    }
    setLoginHomieLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (signupRole === 'buyer') {
        if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
          setError('All fields are required.'); setLoading(false); return
        }
        if (signupPassword.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return }
        const { data, error: err } = await supabase.auth.signUp({
          email: signupEmail, password: signupPassword,
          options: { data: { role: 'construction_buyer', full_name: signupName.trim() }, emailRedirectTo: `${window.location.origin}/construction` }
        })
        if (err) { setError(err.message); setLoading(false); return }
        if (!data.user) { setError('Signup failed.'); setLoading(false); return }
        setSuccess(true)
      } else {
        if (!companyName.trim() || !contactName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
          setError('All fields are required.'); setLoading(false); return
        }
        if (signupPassword.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return }
        const { data, error: err } = await supabase.auth.signUp({
          email: signupEmail, password: signupPassword,
          options: { data: { role: 'construction_supplier', company_name: companyName.trim(), contact_name: contactName.trim() }, emailRedirectTo: `${window.location.origin}/construction` }
        })
        if (err) { setError(err.message); setLoading(false); return }
        if (!data.user) { setError('Signup failed.'); setLoading(false); return }
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    }
    setLoading(false)
  }

  const handleHomieSuccess = () => {
    if (signupRole === 'supplier') {
      window.location.href = '/construction/dashboard'
    } else {
      window.location.href = '/construction'
    }
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
            <p className="text-gray-500 text-sm">Click the link to activate your account, then log in.</p>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/40" style={{ zIndex: 99999 }} onClick={onClose}>
      <div className="bg-white rounded-2xl relative shadow-2xl overflow-y-auto" style={{ width: '560px', maxWidth: 'calc(100vw - 32px)', minHeight: '520px', maxHeight: '90vh', padding: '40px' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>

        {/* Tabs */}
        <div className="flex mb-8 border-b">
          <button className={`flex-1 pb-4 text-base font-semibold transition-colors ${activeTab === 'login' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => { setActiveTab('login'); resetSignup() }}>Log In</button>
          <button className={`flex-1 pb-4 text-base font-semibold transition-colors ${activeTab === 'signup' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => { setActiveTab('signup'); resetSignup() }}>Sign Up</button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

        {/* ── LOGIN TAB ── */}
        {activeTab === 'login' && (
          <div className="space-y-5">
            {/* Regular login form — hidden when Homie flow active */}
            {loginHomieStep === 'idle' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                    className={inputCls} placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showLoginPw ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required
                      className={`${inputCls} pr-12`} placeholder="Enter your password" />
                    <button type="button" onClick={() => setShowLoginPw(!showLoginPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showLoginPw ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 text-base bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>
            )}

            {/* Homie AI login flow */}
            {loginHomieStep === 'idle' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <button type="button" onClick={() => setLoginHomieStep('email')}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 font-semibold rounded-xl transition-colors">
                  <Home size={18} />
                  Log in with Homie AI
                </button>
              </>
            )}

            {/* Homie login: email step */}
            {loginHomieStep === 'email' && (
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-purple-700">Enter your Homie AI email</p>
                  <button type="button" onClick={resetLoginHomie} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                {loginHomieError && <p className="text-red-500 text-xs mb-2">{loginHomieError}</p>}
                <form onSubmit={handleLoginHomieEmailCheck} className="space-y-3">
                  <input type="email" value={loginHomieEmail} onChange={e => setLoginHomieEmail(e.target.value)} required
                    className={purpleInputCls} placeholder="your@email.com" autoFocus />
                  <button type="submit" disabled={loginHomieLoading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                    {loginHomieLoading ? 'Checking...' : 'Check Account'}
                  </button>
                </form>
              </div>
            )}

            {/* Homie login: confirm step */}
            {loginHomieStep === 'confirm' && loginHomieProfile && (
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide">Account found</p>
                  <button type="button" onClick={resetLoginHomie} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg border border-purple-100">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {loginHomieProfile.full_name?.[0]?.toUpperCase() || loginHomieProfile.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{loginHomieProfile.full_name || 'Homie AI User'}</p>
                    <p className="text-xs text-gray-500">{loginHomieProfile.email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-3">Log in to Homie Construction with this account?</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setLoginHomieStep('password')}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    Yes, continue
                  </button>
                  <button type="button" onClick={resetLoginHomie}
                    className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Homie login: password step */}
            {loginHomieStep === 'password' && loginHomieProfile && (
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide">Confirm your identity</p>
                  <button type="button" onClick={resetLoginHomie} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                <div className="flex items-center gap-2 mb-4 p-2 bg-white rounded-lg border border-purple-100">
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {loginHomieProfile.full_name?.[0]?.toUpperCase() || loginHomieProfile.email[0].toUpperCase()}
                  </div>
                  <p className="text-xs text-gray-600">{loginHomieProfile.email}</p>
                </div>
                {loginHomieError && <p className="text-red-500 text-xs mb-2">{loginHomieError}</p>}
                <form onSubmit={handleLoginHomiePassword} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Homie AI Password *</label>
                    <div className="relative">
                      <input type={showLoginHomiePw ? 'text' : 'password'} value={loginHomiePassword} onChange={e => setLoginHomiePassword(e.target.value)} required
                        className={`${purpleInputCls} pr-9`} placeholder="Enter your password" autoFocus />
                      <button type="button" onClick={() => setShowLoginHomiePw(!showLoginHomiePw)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showLoginHomiePw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loginHomieLoading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                    {loginHomieLoading ? 'Logging in...' : '🏠 Log In with Homie AI'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ── SIGNUP TAB ── */}
        {activeTab === 'signup' && (
          <div className="space-y-4">

            {/* Step 1: Role selection */}
            {!signupRole && (
              <>
                <p className="text-center text-base text-gray-500 font-medium">I want to sign up as a...</p>
                <div className="grid grid-cols-2 gap-5 mt-4">
                  <button type="button" onClick={() => setSignupRole('buyer')}
                    className="flex flex-col items-center gap-4 border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 rounded-2xl transition-colors group"
                    style={{ padding: '40px 20px' }}>
                    <span style={{ fontSize: '48px' }}>🛒</span>
                    <span className="font-bold text-gray-800 text-lg group-hover:text-orange-600">Buyer</span>
                    <span className="text-sm text-gray-400 text-center">Browse & purchase construction products</span>
                  </button>
                  <button type="button" onClick={() => setSignupRole('supplier')}
                    className="flex flex-col items-center gap-4 border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 rounded-2xl transition-colors group"
                    style={{ padding: '40px 20px' }}>
                    <span style={{ fontSize: '48px' }}>🏭</span>
                    <span className="font-bold text-gray-800 text-lg group-hover:text-orange-600">Supplier</span>
                    <span className="text-sm text-gray-400 text-center">List & sell your construction products</span>
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Method selection (after role chosen, before method chosen) */}
            {signupRole && !signupMethod && (
              <>
                <button type="button" onClick={resetSignup}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  ← Back
                </button>
                <p className="text-center text-sm text-gray-500">
                  Sign up as a <span className="font-semibold text-gray-700">{signupRole}</span> using...
                </p>
                <div className="space-y-3">
                  <button type="button" onClick={() => setSignupMethod('homie')}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 font-semibold rounded-xl transition-colors">
                    <Home size={18} />
                    Sign up with Homie AI account
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <button type="button" onClick={() => setSignupMethod('form')}
                    className="w-full py-3 border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-700 font-semibold rounded-xl transition-colors text-sm">
                    Sign up with email & password
                  </button>
                </div>
              </>
            )}

            {/* Back button when method is chosen */}
            {signupRole && signupMethod && (
              <button type="button" onClick={() => setSignupMethod(null)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                ← Back
              </button>
            )}

            {/* Homie AI flow */}
            {signupRole && signupMethod === 'homie' && (
              <HomieFlow
                role={signupRole}
                onSuccess={handleHomieSuccess}
                onCancel={() => setSignupMethod(null)}
              />
            )}

            {/* Regular form — Buyer */}
            {signupRole === 'buyer' && signupMethod === 'form' && (
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} required
                    className={inputCls} placeholder="Enter your full name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required
                    className={inputCls} placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showSignupPw ? 'text' : 'password'} value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required
                      className={`${inputCls} pr-12`} placeholder="Create a password (min 6 characters)" />
                    <button type="button" onClick={() => setShowSignupPw(!showSignupPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showSignupPw ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 text-base bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {loading ? 'Creating account...' : 'Sign Up as Buyer'}
                </button>
              </form>
            )}

            {/* Regular form — Supplier */}
            {signupRole === 'supplier' && signupMethod === 'form' && (
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required
                    className={inputCls} placeholder="Enter company name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Name</label>
                  <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} required
                    className={inputCls} placeholder="Enter contact name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required
                    className={inputCls} placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showSignupPw ? 'text' : 'password'} value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required
                      className={`${inputCls} pr-12`} placeholder="Create a password (min 6 characters)" />
                    <button type="button" onClick={() => setShowSignupPw(!showSignupPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showSignupPw ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 text-base bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {loading ? 'Creating account...' : 'Sign Up as Supplier'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
