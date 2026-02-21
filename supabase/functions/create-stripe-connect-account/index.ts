// This file is deprecated - use setup-landlord-payout instead
// Keeping for backward compatibility

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  return new Response(JSON.stringify({ 
    error: 'This endpoint is deprecated. Use setup-landlord-payout instead.'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 410,
  });
});
