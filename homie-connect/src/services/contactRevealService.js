import { query } from './homieDB.js';

/**
 * Returns contact details for a confirmed match pair.
 * Only works when match_requests.status = 'matched'.
 * The requesting user must be one of the two parties.
 */
export async function getMatchedContactDetails(requestingUserId, matchRequestId) {
  // Verify the match exists, is confirmed, and the requester is a party
  const result = await query(`
    SELECT
      mr.id,
      mr.user_id,
      mr.match_user_id,
      mr.intent,
      mr.status,
      -- User A details
      ua.email        AS user_a_email,
      ua.first_name   AS user_a_first_name,
      ua.last_name    AS user_a_last_name,
      ua.phone        AS user_a_phone,
      -- User B details
      ub.email        AS user_b_email,
      ub.first_name   AS user_b_first_name,
      ub.last_name    AS user_b_last_name,
      ub.phone        AS user_b_phone
    FROM match_requests mr
    JOIN auth.users ua ON ua.id::text = mr.user_id
    JOIN auth.users ub ON ub.id::text = mr.match_user_id
    WHERE mr.id = $1
      AND mr.status = 'matched'
      AND (mr.user_id = $2 OR mr.match_user_id = $2)
  `, [matchRequestId, String(requestingUserId)]);

  if (result.rows.length === 0) {
    return { success: false, error: 'Match not found or not yet confirmed' };
  }

  const row = result.rows[0];

  // Return the OTHER party's details to the requester
  const isUserA = String(row.user_id) === String(requestingUserId);
  const partner = isUserA
    ? {
        firstName: row.user_b_first_name,
        lastName: row.user_b_last_name,
        email: row.user_b_email,
        phone: row.user_b_phone ?? null,
      }
    : {
        firstName: row.user_a_first_name,
        lastName: row.user_a_last_name,
        email: row.user_a_email,
        phone: row.user_a_phone ?? null,
      };

  return {
    success: true,
    matchRequestId: row.id,
    intent: row.intent,
    partner,
  };
}

/**
 * Sends contact details to both parties via their preferred channel
 * after a match is confirmed. Called once when status flips to 'matched'.
 */
export async function revealContactsToBothParties(matchRequestId) {
  const result = await query(`
    SELECT
      mr.id,
      mr.user_id,
      mr.match_user_id,
      mr.intent,
      ua.email        AS user_a_email,
      ua.first_name   AS user_a_first_name,
      ua.last_name    AS user_a_last_name,
      ua.phone        AS user_a_phone,
      ua.telegram_chat_id AS user_a_telegram,
      ua.preferred_channel AS user_a_channel,
      ub.email        AS user_b_email,
      ub.first_name   AS user_b_first_name,
      ub.last_name    AS user_b_last_name,
      ub.phone        AS user_b_phone,
      ub.telegram_chat_id AS user_b_telegram,
      ub.preferred_channel AS user_b_channel
    FROM match_requests mr
    JOIN auth.users ua ON ua.id::text = mr.user_id
    JOIN auth.users ub ON ub.id::text = mr.match_user_id
    WHERE mr.id = $1
      AND mr.status = 'matched'
  `, [matchRequestId]);

  if (result.rows.length === 0) {
    return { success: false, error: 'Confirmed match not found' };
  }

  const m = result.rows[0];

  const msgToA = buildRevealMessage(
    m.user_b_first_name, m.user_b_last_name, m.user_b_email, m.user_b_phone, m.intent
  );
  const msgToB = buildRevealMessage(
    m.user_a_first_name, m.user_a_last_name, m.user_a_email, m.user_a_phone, m.intent
  );

  const results = await Promise.allSettled([
    deliverReveal(m.user_a_channel, m.user_a_telegram, m.user_a_phone, msgToA),
    deliverReveal(m.user_b_channel, m.user_b_telegram, m.user_b_phone, msgToB),
  ]);

  return {
    success: results.some(r => r.status === 'fulfilled' && r.value?.success),
    results,
  };
}

// Build the contact reveal message text
function buildRevealMessage(firstName, lastName, email, phone, intent) {
  const name = `${firstName ?? ''} ${lastName ?? ''}`.trim() || 'Your match';
  let msg = `🎉 It's a match! Here are their contact details:\n\n`;
  msg += `👤 Name: ${name}\n`;
  msg += `📧 Email: ${email}\n`;
  if (phone) msg += `📱 Phone: ${phone}\n`;
  msg += `\nGood luck with your ${intentLabel(intent)}!`;
  return msg;
}

function intentLabel(intent) {
  const labels = {
    ROOMMATE: 'roommate search',
    COBUY: 'co-ownership journey',
    EXPERT: 'connection',
    RENOVATION: 'renovation project',
  };
  return labels[intent] ?? 'connection';
}

// Deliver reveal message via the user's preferred channel
async function deliverReveal(channel, telegramChatId, phone, message) {
  if (channel === 'telegram' && telegramChatId) {
    return sendTelegram(telegramChatId, message);
  }
  if ((channel === 'sms' || channel === 'whatsapp') && phone) {
    return sendSMS(phone, message);
  }
  // Fallback: try both if we have the data
  if (telegramChatId) return sendTelegram(telegramChatId, message);
  if (phone) return sendSMS(phone, message);
  return { success: false, error: 'No delivery channel available' };
}

async function sendTelegram(chatId, text) {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      }
    );
    return { success: res.ok };
  } catch (err) {
    console.error('Reveal Telegram send error:', err);
    return { success: false, error: err.message };
  }
}

async function sendSMS(to, body) {
  try {
    const res = await fetch(
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
    return { success: res.ok };
  } catch (err) {
    console.error('Reveal SMS send error:', err);
    return { success: false, error: err.message };
  }
}
