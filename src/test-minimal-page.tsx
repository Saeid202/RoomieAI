import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";

type TestStatus = 
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error';   message: string };

export default function TestMinimalPage() {
  const [result, setResult] = useState<TestStatus>({ status: 'loading' });

  const safeGetMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return "Unknown error (no message available)";
  };

  const testBasicConnection = async () => {
    try {
      // 1. Auth check
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const userEmail = user?.email ?? 'anonymous / not signed in';

      // 2. Table existence + connectivity check
      const { data, error: queryError, count } = await supabase
        .from('co_ownership_signals')
        .select('id', { count: 'exact', head: true }) // ← much lighter than select(*)
        .limit(0);   // we don't need rows

      if (queryError) throw queryError;

      setResult({
        status: 'success',
        message: `✅ Connected! ${count ?? '?'} signals exist. User: ${userEmail}`
      });
    } catch (err) {
      const msg = safeGetMessage(err);

     

      // Nice hint for the most common dev issue
      if ((err as PostgrestError)?.code === '42P01') {
      }

      setResult({ status: 'error', message: msg });
      console.error('Connection test failed:', err);
    }
  };

  useEffect(() => {
    testBasicConnection();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">🔍 Minimal Supabase Test</h1>

        <div className="space-y-6">
          <div className={`p-5 rounded-lg border ${
            result.status === 'loading' ? 'bg-gray-50 border-gray-200' :
            result.status === 'success' ? 'bg-green-50 border-green-200' :
            'bg-red-50 border-red-200'
          }`}>
            <h2 className="text-lg font-semibold mb-2">
              {result.status === 'loading' ? 'Testing…' :
               result.status === 'success' ? 'Success' : 'Failed'}
            </h2>
            
            <p className="font-mono text-sm whitespace-pre-wrap">
              {result.status === 'loading' ? '⏳ Checking auth + table access...' : result.message}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <strong>Tip:</strong> open browser console (F12) to see detailed logs
          </div>
        </div>
      </div>
    </div>
  );
}