import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendInviteRequest {
  recipientEmail: string;
  communityName: string;
  communityDescription?: string;
  communityCity?: string;
  senderName: string;
  communityId: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      recipientEmail,
      communityName,
      communityDescription,
      communityCity,
      senderName,
      communityId,
    } = (await req.json()) as SendInviteRequest;

    if (!recipientEmail || !communityName || !senderName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build the invite link
    const inviteLink = `${Deno.env.get("VITE_APP_URL") || "https://homei.app"}/community-invite/${communityId}`;

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #f97316 100%); color: white; padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .content { background: #f9fafb; padding: 40px 20px; border-radius: 0 0 12px 12px; }
            .community-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
            .community-name { font-size: 20px; font-weight: bold; color: #111; margin-bottom: 8px; }
            .community-details { color: #666; font-size: 14px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You're Invited!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p><strong>${senderName}</strong> has invited you to join the <strong>${communityName}</strong> community on Homei.</p>
              
              <div class="community-info">
                <div class="community-name">${communityName}</div>
                <div class="community-details">
                  ${communityDescription ? `<p>${communityDescription}</p>` : ""}
                  ${communityCity ? `<p>📍 ${communityCity}</p>` : ""}
                </div>
              </div>

              <p>Join the community to connect with like-minded people, share experiences, and find roommates.</p>

              <center>
                <a href="${inviteLink}" class="cta-button">Join Community</a>
              </center>

              <p style="color: #666; font-size: 14px;">
                Or copy this link: <br>
                <code style="background: #f0f0f0; padding: 8px; border-radius: 4px; display: inline-block; margin-top: 8px;">${inviteLink}</code>
              </p>

              <div class="footer">
                <p>This is an automated message from Homei. If you didn't expect this invitation, you can safely ignore it.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend or similar service
    // For now, we'll use Supabase's built-in email (if configured)
    // In production, you might want to use Resend, SendGrid, or similar
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      // Use Resend if available
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "invites@homei.app",
          to: recipientEmail,
          subject: `${senderName} invited you to join ${communityName}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Resend error:", error);
        throw new Error("Failed to send email");
      }

      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // Fallback: Log that email would be sent
      console.log("Email would be sent to:", recipientEmail);
      console.log("Subject:", `${senderName} invited you to join ${communityName}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Invite recorded (email service not configured)" 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
