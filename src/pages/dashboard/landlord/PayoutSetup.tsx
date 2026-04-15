import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { getPayoutStatus, savePayoutBankAccount, type PayoutStatus } from '@/services/payoutService';

// Canadian banks with institution numbers
const CANADIAN_BANKS = [
  { name: 'TD Canada Trust', code: '004' },
  { name: 'Royal Bank (RBC)', code: '003' },
  { name: 'Bank of Nova Scotia (Scotiabank)', code: '002' },
  { name: 'Bank of Montreal (BMO)', code: '001' },
  { name: 'CIBC', code: '010' },
  { name: 'National Bank', code: '006' },
  { name: 'HSBC Canada', code: '016' },
  { name: 'Desjardins', code: '815' },
  { name: 'Tangerine', code: '614' },
  { name: 'Other', code: '' },
];

const inputClass = `
  w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900
  text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
  transition-all placeholder-gray-400
`.trim();

const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';

export default function PayoutSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<PayoutStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [forceShowForm, setForceShowForm] = useState(false);

  // Form fields
  const [holderName, setHolderName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [institutionCode, setInstitutionCode] = useState('');
  const [transit, setTransit] = useState('');
  const [account, setAccount] = useState('');
  const [accountConfirm, setAccountConfirm] = useState('');
  const [showCheque, setShowCheque] = useState(false);

  useEffect(() => {
    if (!user) return;
    getPayoutStatus(user.id)
      .then(s => {
        setStatus(s);
        // Pre-fill holder name if editing
        if (s.account_holder_name) setHolderName(s.account_holder_name);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bank = CANADIAN_BANKS.find(b => b.name === e.target.value);
    setSelectedBank(e.target.value);
    if (bank && bank.code) setInstitutionCode(bank.code);
    else setInstitutionCode('');
  };

  const validate = (): string => {
    if (!holderName.trim()) return 'Enter the account holder name';
    if (!institutionCode || institutionCode.length !== 3) return 'Select your bank or enter a 3-digit institution number';
    if (transit.length !== 5) return 'Transit number must be exactly 5 digits';
    if (account.length < 7 || account.length > 12) return 'Account number must be 7–12 digits';
    if (account !== accountConfirm) return 'Account numbers do not match';
    return '';
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSaving(true);
    try {
      await savePayoutBankAccount({
        account_holder_name: holderName,
        institution_number: institutionCode,
        transit_number: transit,
        account_number: account,
      });
      toast.success('Bank account connected! Payouts are now enabled.');
      navigate('/dashboard/landlord/payments');
    } catch (e: any) {
      setError(e.message || 'Failed to connect bank account. Please check your details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600" />
    </div>
  );

  // Already connected state — show inline summary + form directly
  if (status?.connected && !forceShowForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Current account summary */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-900 text-sm">Connected Account</p>
                <p className="text-green-700 text-sm">
                  {status.bank_name && <span>{status.bank_name} · </span>}
                  ••••{status.last4}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/landlord/payments')}
              className="text-sm text-green-700 font-semibold hover:text-green-900"
            >
              Go to Payments →
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Update Bank Account</h1>
            <p className="text-gray-500 mt-1">Enter your new Canadian bank account details below.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{status?.connected ? 'Update Bank Account' : 'Set Up Payouts'}</h1>
          <p className="text-gray-500 mt-1">{status?.connected ? 'Enter your new bank account details below.' : 'Add your Canadian bank account to receive rent payments automatically.'}</p>
        </div>

        {/* Current account banner when updating */}
        {status?.connected && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-900 text-sm">Current: {status.bank_name && `${status.bank_name} · `}••••{status.last4}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/landlord/payments')}
              className="text-xs text-green-700 font-semibold hover:text-green-900"
            >
              Go to Payments →
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

          {/* Security note when updating */}
          {holderName && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold mb-0.5">Updating your bank account</p>
              <p className="text-xs">For security, please re-enter your complete banking details. Your account number is not stored.</p>
            </div>
          )}

          {/* Account Holder Name */}
          <div>
            <label className={labelClass}>Account Holder Name</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Full legal name as on your bank account"
              value={holderName}
              onChange={e => setHolderName(e.target.value)}
            />
          </div>

          {/* Bank Selector */}
          <div>
            <label className={labelClass}>Your Bank</label>
            <select
              className={inputClass}
              value={selectedBank}
              onChange={handleBankSelect}
            >
              <option value="">Select your bank...</option>
              {CANADIAN_BANKS.map(b => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Institution + Transit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Institution Number</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                className={inputClass + ' font-mono'}
                placeholder="3 digits"
                value={institutionCode}
                onChange={e => setInstitutionCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass.replace('mb-1.5', '')}>Transit Number</label>
                <button
                  type="button"
                  onClick={() => setShowCheque(v => !v)}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Where is this?
                </button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                className={inputClass + ' font-mono'}
                placeholder="5 digits"
                value={transit}
                onChange={e => setTransit(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          {/* Cheque diagram */}
          {showCheque && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">Find these numbers at the bottom of a cheque:</p>
              <div className="font-mono bg-white border border-blue-200 rounded-lg p-3 text-center text-xs tracking-widest">
                ⑆ <span className="text-purple-700 font-bold">TTTTT</span> ⑆ <span className="text-blue-700 font-bold">III</span> ⑆ <span className="text-green-700 font-bold">AAAAAAAAAA</span>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span><span className="text-purple-700 font-bold">T</span> = Transit (5)</span>
                <span><span className="text-blue-700 font-bold">I</span> = Institution (3)</span>
                <span><span className="text-green-700 font-bold">A</span> = Account</span>
              </div>
              <p className="mt-2 text-blue-600">Example: Transit <span className="font-mono font-bold">30171</span> · Institution <span className="font-mono font-bold">002</span> (Scotiabank)</p>
            </div>
          )}

          {/* Account Number */}
          <div>
            <label className={labelClass}>Account Number</label>
            <input
              type="text"
              inputMode="numeric"
              className={inputClass + ' font-mono'}
              placeholder="7–12 digits"
              value={account}
              onChange={e => setAccount(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {/* Confirm Account */}
          <div>
            <label className={labelClass}>Confirm Account Number</label>
            <input
              type="text"
              inputMode="numeric"
              className={inputClass + ' font-mono'}
              placeholder="Re-enter account number"
              value={accountConfirm}
              onChange={e => setAccountConfirm(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base hover:from-purple-700 hover:to-pink-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Connecting...
              </>
            ) : 'Save Bank Account'}
          </button>

          <p className="text-center text-xs text-gray-400">
            🔒 Your banking information is encrypted and processed securely via Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
