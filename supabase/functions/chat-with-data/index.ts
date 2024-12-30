import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, files, projectId } = await req.json();
    console.log('Received request:', { message, files, projectId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user ID from the authorization header
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError) throw userError;

    if (!user) {
      throw new Error('User not found');
    }

    // Process files if any
    let fileContent = '';
    if (files && files.length > 0) {
      fileContent = `Files attached: ${files.map(f => f.name).join(', ')}`;
    }

    // Use Perplexity API for chat completion
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant. ${fileContent}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${await perplexityResponse.text()}`);
    }

    const aiResponse = await perplexityResponse.json();
    const responseContent = aiResponse.choices[0].message.content;

    // Store the conversation in the database
    const { error: chatError } = await supabase
      .from('project_chat_history')
      .insert([
        {
          project_id: projectId,
          user_id: user.id,
          message: message,
          role: 'user'
        },
        {
          project_id: projectId,
          user_id: user.id,
          message: responseContent,
          role: 'assistant'
        }
      ]);

    if (chatError) throw chatError;

    return new Response(
      JSON.stringify({ response: responseContent }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in chat-with-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});