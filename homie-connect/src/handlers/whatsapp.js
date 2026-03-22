import { generateResponse, resetSession } from '../services/brain.js';
import { formatMatchWhatsApp, formatNoMatchResponse, formatEmergencyDispatchResponse, formatIntroSentResponse } from '../services/formatter.js';
import { findMatches } from '../services/matchingEngine.js';
import { sendNotification } from '../services/notificationService.js';
import { getSession, saveSession, deleteSession } from '../services/sessionStore.js';
import { query } from '../services/homieDB.js';
import { revealContactsToBothParties } from '../services/contactRevealService.js';

// Handle WhatsApp webhook
export async function whatsappWebhook(req, res) {
  try {
    const entry = req.body.entry?.[0];
    if (!entry) {
      return res.status(400).json({ error: 'No entry' });
    }
    
    const changes = entry.changes?.[0];
    if (!changes) {
      return res.status(400).json({ error: 'No changes' });
    }
    
    const value = changes.value;
    const messages = value.messages;
    
    if (!messages || messages.length === 0) {
      // Handle status updates (e.g., message read)
      return res.status(200).json({ ok: true });
    }
    
    const message = messages[0];
    
    // Mark message as read
    await markMessageAsRead(message.id);
    
    const userId = message.from;
    const text = (message.text?.body || '').trim();

    // Double opt-in reply: User B replies YES/NO to a pending intro request
    if (/^yes$/i.test(text) || /^no$/i.test(text)) {
      const pending = await query(`
        SELECT id, user_id, match_user_id, status
        FROM match_requests
        WHERE match_user_id = $1
          AND status = 'user_a_accepted'
          AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `, [userId]);

      if (pending.rows.length > 0) {
        const req = pending.rows[0];

        if (/^yes$/i.test(text)) {
          await query(`UPDATE match_requests SET status = 'matched' WHERE id = $1`, [req.id]);

          await revealContactsToBothParties(req.id);

          await sendWhatsAppMessage(userId, "It's a match! 🎉 Both of you confirmed. Contact details are now shared.");
        } else {
          await query(`UPDATE match_requests SET status = 'declined' WHERE id = $1`, [req.id]);
          await sendWhatsAppMessage(userId, "No worries! I'll keep looking for a better match for you.");
        }

        return res.status(200).json({ ok: true });
      }
    }
    
    // Generate response
    const { responseText, matchReady } = await generateResponse('whatsapp', userId, text);
    
    // Check for MATCH_READY signal
    if (matchReady) {
      // Find matches
      const matches = await findMatches(matchReady.intent, { ...matchReady.answers, userId });
      
      if (matches.length > 0) {
        // Send first match
        const match = matches[0];
        const formatted = formatMatchWhatsApp(match, matchReady.intent);
        
        await sendWhatsAppMessage(userId, formatted.text, formatted.interactive);
        
        // Store match request in DB for double opt-in
        await storeMatchRequest(userId, match.user_id, matchReady.intent);
        
        // Notify matched user
        await sendNotification(
          match.user_id,
          'New Match Introduction',
          `You have a new match with someone looking for ${matchReady.intent}`,
          { type: 'intro_request', requester_id: userId }
        );
      } else {
        await sendWhatsAppMessage(userId, formatNoMatchResponse());
      }
    } else {
      await sendWhatsAppMessage(userId, responseText);
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper: Mark message as read
async function markMessageAsRead(messageId) {
  try {
    const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages/${messageId}`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ read: true }),
    });
  } catch (error) {
    console.error('WhatsApp mark read error:', error);
  }
}

// Helper: Send WhatsApp message
async function sendWhatsAppMessage(to, text, interactive = null) {
  try {
    const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: interactive ? 'interactive' : 'text',
        ...(interactive ? { interactive } : { text: { body: text } }),
      }),
    });
  } catch (error) {
    console.error('WhatsApp send error:', error);
  }
}

// Helper: Store match request for double opt-in
async function storeMatchRequest(userId, matchUserId, intent) {
  try {
    await query(`
      INSERT INTO match_requests (user_id, match_user_id, intent, status, created_at)
      VALUES ($1, $2, $3, 'pending', NOW())
      ON CONFLICT (user_id, match_user_id) DO NOTHING
    `, [userId, matchUserId, intent]);
  } catch (error) {
    console.error('Store match request error:', error);
  }
}
