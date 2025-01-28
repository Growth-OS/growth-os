import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const UNIPILE_API_KEY = Deno.env.get('UNIPILE_API_KEY')
const UNIPILE_DSN = Deno.env.get('UNIPILE_DSN')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate environment variables
    if (!UNIPILE_API_KEY || !UNIPILE_DSN) {
      throw new Error('Missing required environment variables')
    }

    console.log('Initializing WhatsApp connection request...')
    
    // Make request to Unipile API to create WhatsApp account
    const response = await fetch(`${UNIPILE_DSN}/api/v1/accounts`, {
      method: 'POST',
      headers: {
        'X-API-KEY': UNIPILE_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'WHATSAPP'
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Unipile API error:', errorData)
      throw new Error('Failed to generate QR code')
    }

    const data = await response.json()
    console.log('Successfully received WhatsApp connection data:', data)

    // Extract QR code and session ID from response
    const qrCode = data.qr_code
    const sessionId = data.session_id

    if (!qrCode || !sessionId) {
      throw new Error('Invalid response from Unipile API')
    }

    return new Response(
      JSON.stringify({
        qrCode,
        sessionId
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in WhatsApp connection:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred while connecting to WhatsApp'
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500,
      },
    )
  }
})