import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';

type Status = 'pending' | 'success' | { error: string };

type TestState = {
  auth: Status;
  salesListings: Status;
  coOwnershipSignals: Status;
};

export default function TestDBConnection() {
  const [state, setState] = useState<TestState>({
    auth: 'pending',
    salesListings: 'pending',
    coOwnershipSignals: 'pending',
  });

  const safeMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return String(err) || 'Unknown error';
  };

  const runTests = async () => {
    setState({
      auth: 'pending',
      salesListings: 'pending',
      coOwnershipSignals: 'pending',
    });

    // Auth
    try {
      const { error } = await supabase.auth.getUser();
      if (error) throw error;
      setState((s) => ({ ...s, auth: 'success' }));
    } catch (err) {
      setState((s) => ({ ...s, auth: { error: safeMessage(err) } }));
    }

    // sales_listings
    try {
      const { error } = await supabase
        .from('sales_listings')
        .select('id', { count: 'exact', head: true });
      if (error) throw error;
      setState((s) => ({ ...s, salesListings: 'success' }));
    } catch (err) {
      const msg =
        (err as PostgrestError)?.code === '42P01'
          ? "Table 'sales_listings' does not exist"
          : safeMessage(err);
      setState((s) => ({ ...s, salesListings: { error: msg } }));
    }

    // co_ownership_signals
    try {
      const { error } = await supabase
        .from('co_ownership_signals')
        .select('id', { count: 'exact', head: true });
      if (error) throw error;
      setState((s) => ({ ...s, coOwnershipSignals: 'success' }));
    } catch (err) {
      const msg =
        (err as PostgrestError)?.code === '42P01'
          ? "Table 'co_ownership_signals' does not exist"
          : safeMessage(err);
      setState((s) => ({ ...s, coOwnershipSignals: { error: msg } }));
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <TestBlock title="Auth" status={state.auth} />
        <TestBlock title="sales_listings" status={state.salesListings} />
        <TestBlock title="co_ownership_signals" status={state.coOwnershipSignals} />
      </div>

      <button
        onClick={runTests}
        className="mt-6 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Run Again
      </button>
    </div>
  );
}

function TestBlock({ title, status }: { title: string; status: Status }) {
  let className = 'p-4 rounded border ';
  let text = '⏳ Testing...';

  if (status === 'success') {
    className += 'bg-green-50 border-green-200 text-green-800';
    text = '✅ OK';
  } else if (typeof status === 'object') {
    className += 'bg-red-50 border-red-200 text-red-800';
    text = `❌ ${status.error}`;
  }

  return (
    <div className={className}>
      <h3 className="font-semibold mb-1">{title}</h3>
      <div className="text-sm">{text}</div>
    </div>
  );
}