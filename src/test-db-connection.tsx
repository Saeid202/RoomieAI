import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';

type Status = 'pending' | 'success' | { error: string };

type TestState = {
  auth: Status;
  salesListings: Status;
  signals: Status;
};

export default function TestDBConnection() {
  const [state, setState] = useState<TestState>({
    auth: 'pending',
    salesListings: 'pending',
    signals: 'pending',
  });

  const getErrorMsg = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return String(err) || 'Unknown error';
  };

  const runTests = async () => {
    setState({ auth: 'pending', salesListings: 'pending', signals: 'pending' });

    // 1. Auth
    try {
      const { error } = await supabase.auth.getUser();
      if (error) throw error;
      setState(s => ({ ...s, auth: 'success' }));
    } catch (err) {
      setState(s => ({ ...s, auth: { error: getErrorMsg(err) } }));
    }

    // 2. sales_listings
    try {
      const { error } = await supabase
        .from('sales_listings')
        .select('id', { count: 'exact', head: true });
      if (error) throw error;
      setState(s => ({ ...s, salesListings: 'success' }));
    } catch (err) {
      const msg = (err as PostgrestError)?.code === '42P01'
        ? "Table 'sales_listings' does NOT exist"
        : getErrorMsg(err);
      setState(s => ({ ...s, salesListings: { error: msg } }));
    }

    // 3. co_ownership_signals
    try {
      const { error } = await supabase
        .from('co_ownership_signals')
        .select('id', { count: 'exact', head: true });
      if (error) throw error;
      setState(s => ({ ...s, signals: 'success' }));
    } catch (err) {
      const msg = (err as PostgrestError)?.code === '42P01'
        ? "Table 'co_ownership_signals' does NOT exist"
        : getErrorMsg(err);
      setState(s => ({ ...s, signals: { error: msg } }));
    }
  };

  useEffect(() => { runTests(); }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Supabase Connection Test</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <StatusCard title="Authentication" status={state.auth} />
        <StatusCard title="Sales Listings Table" status={state.salesListings} />
        <StatusCard title="Co-Ownership Signals Table" status={state.signals} />
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={runTests}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          Run Tests Again
        </button>
      </div>
    </div>
  );
}

function StatusCard({ title, status }: { title: string; status: Status }) {
  let bg = 'bg-gray-50 border-gray-200 text-gray-700';
  let text = '⏳ Testing...';

  if (status === 'success') {
    bg = 'bg-green-50 border-green-200 text-green-800';
    text = '✅ Working perfectly';
  } else if (typeof status === 'object') {
    bg = 'bg-red-50 border-red-200 text-red-800';
  }

  return (
    <div className={`p-6 rounded-xl border ${bg} shadow-sm`}>
      <h3 className="font-bold text-lg mb-3">{title}</h3>
      <p className="text-base font-medium">{text}</p>
    </div>
  );
}