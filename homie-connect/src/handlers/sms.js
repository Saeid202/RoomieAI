import { generateResponse, resetSession } from '../services/brain.js';
import { formatMatchSMS, formatNoMatchResponse, formatEmergencyDispatchResponse, formatIntroSentResponse } from '../services/formatter.js';
import { findMatches } from '../services/matchingEngine.js';
import { sendNotification } from '../services/notificationService.js';
import { getSession, saveSession, deleteSession } from '../services/sessionStore.js';
import { query } from '../services/homieDB.js';
import { revealContactsToBothParties } from '../services/contactRevealService.js';

// Handle SMS webhook (Twilio)
export async function smsWebhook(req, res) {
  try {
    const { From, To, Body } = req.body;
    
    if (!From || !Body) {
      return res.status(400).send('<Response><Message>Invalid request</Message></Response>');
    }
    
    const userId = From; // Use phone number as user ID
    const text = Body.trim();

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
        const matchReq = pending.rows[0];

        if (/^yes$/i.test(text)) {
          await query(`UPDATE match_requests SET status = 'matched' WHERE id = $1`, [matchReq.id]);

          await revealContactsToBothParties(matchReq.id);

          await sendSMS(From, "It's a match! Both of you confirmed. Contact details are now shared.");
        } else {
          await query(`UPDATE match_requests SET status = 'declined' WHERE id = $1`, [matchReq.id]);
          await sendSMS(From, "No worries! I'll keep looking for a better match for you.");
        }

        res.type('text/xml');
        return res.send('<Response></Response>');
      }
    }
    
    // Generate response
    const { responseText, matchReady } = await generateResponse('sms', userId, text);
    
    // Check for MATCH_READY signal
    if (matchReady) {
      // Find matches
      const matches = await findMatches(matchReady.intent, { ...matchReady.answers, userId });
      
      if (matches.length > 0) {
        // Send first match
        const match = matches[0];
        const formatted = formatMatchSMS(match, matchReady.intent);
        
        await sendSMS(To, formatted);
        
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
        await sendSMS(To, formatNoMatchResponse());
      }
    } else {
      await sendSMS(To, responseText);
    }
    
    res.type('text/xml');
    res.send('<Response><Message></Message></Response>');
  } catch (error) {
    console.error('SMS webhook error:', error);
    res.status(500).send('<Response><Message>Error processing request</Message></Response>');
  }
}

// Helper: Send SMS via Twilio
async function sendSMS(to, body) {
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER,
          To: to,
          Body: body,
        }),
      }
    );
    
    if (!response.ok) {
      console.error('SMS send failed:', await response.text());
    }
  } catch (error) {
    console.error('SMS send error:', error);
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
