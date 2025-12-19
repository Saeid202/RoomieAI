
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { description, propertyId, voiceId } = await req.json();

        if (!description) {
            return new Response(JSON.stringify({ error: 'Description is required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`Generating audio for property ${propertyId} with description length ${description.length}`);

        // 1. Generate Audio using OpenAI TTS (Text-to-Speech)
        // Ensure you have OPENAI_API_KEY set in your Supabase secrets
        // supabase secrets set OPENAI_API_KEY=sk-...

        const openAIKey = Deno.env.get('OPENAI_API_KEY');
        if (!openAIKey) {
            throw new Error('Missing OPENAI_API_KEY secret');
        }

        const openAIResponse = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAIKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: description.substring(0, 4096), // OpenAI limit
                voice: voiceId || 'alloy',
            }),
        });

        if (!openAIResponse.ok) {
            const errorText = await openAIResponse.text();
            console.error('OpenAI TTS Error:', errorText);
            throw new Error(`OpenAI API error: ${errorText}`);
        }

        // 2. Get the audio buffer
        const audioBuffer = await openAIResponse.arrayBuffer();

        // 3. Upload to Supabase Storage
        // We'll use the Supabase Admin client to bypass RLS for upload if needed, 
        // or just use the standard client if we had auth context. 
        // Here we keep it simple assuming we have SERVICE_ROLE_KEY or proceed with auth context if passed.
        // For simplicity in this demo function, let's return the audio as a blob or base64?
        // No, the requirement is to store it.

        // However, edge functions run in Deno and don't have the full supabase-js client with auth context easily unless passed.
        // Better pattern: Frontend generates, or we use a Service User here.

        // Let's use the standard supabase client injected in Deno environment if available, 
        // or construct one.

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase configuration');
        }

        // We can't import createClient from @supabase/supabase-js in Deno directly without CDN
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const fileName = `${propertyId}/audio-description-${Date.now()}.mp3`;

        const { data, error: uploadError } = await supabase.storage
            .from('property-audio')
            .upload(fileName, audioBuffer, {
                contentType: 'audio/mpeg',
                upsert: true
            });

        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // 4. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('property-audio')
            .getPublicUrl(fileName);

        return new Response(JSON.stringify({ audioUrl: publicUrl }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Function Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
