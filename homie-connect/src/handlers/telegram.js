import { generateResponse, resetSession } from '../services/brain.js';
import { formatMatchTelegram, formatNoMatchResponse, formatEmergencyDispatchResponse, formatIntroSentResponse } from '../services/formatter.js';
import { findMatches } from '../services/matchingEngine.js';
import { sendNotification } from '../services/notificationService.js';
import { getSession, saveSession, deleteSession } from '../services/sessionStore.js';
import { query } from '../services/homieDB.js';
import { revealContactsToBothParties } from '../services/contactRevealService.js';
import { 
  formatRenovatorCard, 
  formatMatchesFound, 
  formatEmergencyDispatch,
  formatProviderRegistration,
  getMatchButtons 
} from '../services/renovatorFormatter.js';
import {
  recordCustomerAcceptance,
  recordRenovatorAcceptance,
  getRenovationMatchContacts,
  formatCustomerContactMessage,
  formatRenovatorContactMessage,
} from '../services/renovationMatchAcceptance.js';

// Handle Telegram webhook
export async function telegramWebhook(req, res) {
  try {
    console.log('📨 Telegram webhook received');
    console.log('Body:', JSON.stringify(req.body));
    
    const { message } = req.body || {};
    
    if (!message) {
      console.log('❌ No message in request body');
      return res.status(200).json({ ok: true });
    }
    
    const userId = message.from?.id;
    const chatId = message.chat?.id;
    const text = message.text || '';
    const username = message.from?.username || null; // Get Telegram username
    
    console.log(`📱 Message from user ${userId} (@${username}): "${text}"`);
    
    // Store username in session for later use
    let session = await getSession('telegram', userId);
    if (session && !session.telegramUsername) {
      session.telegramUsername = username;
      await saveSession('telegram', userId, session);
    }
    
    // Handle /start command
    if (text === '/start') {
      console.log('✅ /start command detected');
      await sendTelegramMessage(chatId, "Hey! I'm Homie 👋 I connect people across HomieAI — roommates, co-buyers, lawyers, brokers, and renovators. What are you looking for today?");
      return res.status(200).json({ ok: true });
    }
    
    // Handle /reset command
    if (text === '/reset' || text.toLowerCase() === 'start over') {
      console.log('🔄 /reset command detected');
      await deleteSession('telegram', userId);
      await sendTelegramMessage(chatId, "Got it! Let's start fresh. What are you looking for today?");
      return res.status(200).json({ ok: true });
    }
    
    // Show typing indicator
    console.log('⏳ Sending typing indicator');
    await sendTelegramChatAction(chatId, 'typing');
    
    // Generate response
    console.log('🧠 Calling generateResponse...');
    const result = await generateResponse('telegram', userId, text);
    const { responseText, matchReady } = result || {};
    
    // Safety check: ensure responseText is defined
    if (!responseText) {
      console.error('❌ responseText is undefined, using fallback');
      await sendTelegramMessage(chatId, "I'm having trouble processing that. Can you try again?");
      return res.status(200).json({ ok: true });
    }
    
    console.log('✅ generateResponse returned:', { responseText: responseText.substring(0, 100), matchReady });
    
    // Check for MATCH_READY signal
    if (matchReady) {
      console.log('🎯 MATCH_READY signal detected');
      
      // Handle renovation matches
      if (matchReady.intent === 'RENOVATION') {
        if (matchReady.role === 'provider') {
          // Provider registration complete
          console.log('✅ Renovator provider registered');
          const formatted = formatProviderRegistration(matchReady.answers);
          await sendTelegramMessage(chatId, formatted, { parse_mode: 'HTML' });
        } else if (matchReady.role === 'seeker') {
          // Customer request - show matches
          if (matchReady.emergency) {
            console.log('🚨 Emergency dispatch');
            const formatted = formatEmergencyDispatch();
            await sendTelegramMessage(chatId, formatted, { parse_mode: 'HTML' });
          } else if (matchReady.matches && matchReady.matches.length > 0) {
            console.log(`Found ${matchReady.matches.length} renovation matches`);
            
            // Show header
            const header = formatMatchesFound(matchReady.matches, matchReady.matches.length);
            await sendTelegramMessage(chatId, header, { parse_mode: 'HTML' });
            
            // Show first match with buttons
            const match = matchReady.matches[0];
            const matchCard = formatRenovatorCard(match, match.score);
            const buttons = getMatchButtons(`reno_${matchReady.answers.request_id}_${match.user_id}`, 'customer');
            
            await sendTelegramMessage(chatId, matchCard, { 
              parse_mode: 'HTML',
              reply_markup: buttons 
            });
          } else {
            console.log('❌ No renovation matches found');
            await sendTelegramMessage(chatId, "I don't have a match right now, but I've saved your criteria. I'll notify you when someone joins who fits!");
          }
        }
        return res.status(200).json({ ok: true });
      }
      
      // Handle other intents (roommate, cobuy, expert)
      console.log('🎯 MATCH_READY signal detected, finding matches...');
      try {
        // Find matches
        const matches = await findMatches(matchReady.intent, { ...matchReady.answers, userId });
        console.log(`Found ${matches.length} matches`);
        
        if (matches.length > 0) {
          // Send first match
          const match = matches[0];
          const formatted = formatMatchTelegram(match, matchReady.intent);
          
          await sendTelegramMessage(chatId, formatted.text, { parse_mode: 'HTML', reply_markup: formatted.reply_markup });
          
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
          console.log('❌ No matches found');
          await sendTelegramMessage(chatId, formatNoMatchResponse());
        }
      } catch (dbError) {
        console.error('❌ Database error finding matches:', dbError.message);
        await sendTelegramMessage(chatId, "I'm having trouble finding matches right now. Please try again later!");
      }
    } else {
      // No match ready - just send the response
      console.log('💬 Sending response:', responseText.substring(0, 100));
      await sendTelegramMessage(chatId, responseText, { parse_mode: 'HTML' });
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('❌ Telegram webhook error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(200).json({ ok: true });
  }
}

// Helper: Send Telegram message
async function sendTelegramMessage(chatId, text, options = {}) {
  try {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...options,
      }),
    });
    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram API error:', data);
    }
  } catch (error) {
    console.error('Telegram send error:', error.message);
  }
}

// Helper: Send Telegram chat action (typing indicator)
async function sendTelegramChatAction(chatId, action) {
  try {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendChatAction`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action,
      }),
    });
  } catch (error) {
    console.error('Telegram chat action error:', error);
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

// Export for button callback handling
export async function handleTelegramButton(callbackQuery) {
  const { data, from, message } = callbackQuery;
  console.log(`🔘 Button clicked: ${data} by user ${from.id}`);
  
  // Handle renovation match buttons
  if (data.startsWith('reno_')) {
    return handleRenovationButton(data, from, message);
  }
  
  // Handle other match buttons
  const [action, targetUserId] = data.split(':');

  if (action === 'connect') {
    // Check if User B is accepting (user_a_accepted already exists for this pair)
    const existing = await query(`
      SELECT id, status, user_id, match_user_id
      FROM match_requests
      WHERE ((user_id = $1 AND match_user_id = $2) OR (user_id = $2 AND match_user_id = $1))
        AND status IN ('pending', 'user_a_accepted')
        AND expires_at > NOW()
      LIMIT 1
    `, [String(from.id), String(targetUserId)]);

    if (existing.rows.length === 0) {
      await sendTelegramMessage(message.chat.id, "This match has expired or is no longer available.");
      return;
    }

    const req = existing.rows[0];

    if (req.status === 'pending' && String(req.user_id) === String(from.id)) {
      // User A is accepting their own outgoing request → mark user_a_accepted, notify User B
      await query(`
        UPDATE match_requests SET status = 'user_a_accepted' WHERE id = $1
      `, [req.id]);

      await sendTelegramMessage(message.chat.id, formatIntroSentResponse());

      await sendNotification(
        targetUserId,
        'Someone wants to connect',
        'A Homie match wants to connect with you. Reply YES to confirm.',
        { type: 'intro_request', requester_id: String(from.id), match_request_id: req.id }
      );

    } else if (req.status === 'user_a_accepted' && String(req.match_user_id) === String(from.id)) {
      // User B is accepting → both confirmed → mark matched, notify both
      await query(`
        UPDATE match_requests SET status = 'matched' WHERE id = $1
      `, [req.id]);

      // Reveal contact details to both parties
      await revealContactsToBothParties(req.id);

      // Confirm to User B in chat
      await sendTelegramMessage(
        message.chat.id,
        "It's a match! 🎉 Both of you confirmed. Contact details are now shared."
      );
    } else {
      await sendTelegramMessage(message.chat.id, "Already connected or waiting for the other person.");
    }

  } else if (action === 'more') {
    await sendTelegramMessage(message.chat.id, 'Showing more matches...');
  }
}

// Handle renovation match buttons
async function handleRenovationButton(data, from, message) {
  console.log(`🔨 Raw button data: "${data}"`);
  
  const parts = data.split(':');
  const actionPart = parts[0]; // e.g., "reno_connect"
  const fullMatchId = parts[1]; // e.g., "reno_cache-402995277-1774184764128_5819857900"
  
  const action = actionPart.replace('reno_', '');
  console.log(`🔨 Parsed: action=${action}, fullMatchId=${fullMatchId}`);
  
  // Remove "reno_" prefix if present
  let cleanMatchId = fullMatchId.startsWith('reno_') ? fullMatchId.substring(5) : fullMatchId;
  
  // Extract IDs from cleanMatchId
  // Format: cache-[customerId]-[timestamp]_[renovatorId]
  const matchParts = cleanMatchId.split('_');
  const renovatorId = parseInt(matchParts[matchParts.length - 1]); // Last part is renovator ID
  
  // Extract customer ID from cache-[customerId]-[timestamp] part
  const cachePrefix = matchParts.slice(0, -1).join('_'); // Everything except last part
  const cacheParts = cachePrefix.split('-');
  const customerId = parseInt(cacheParts[1]); // Second part after "cache"
  const requestId = cachePrefix; // Full cache prefix is the request ID
  
  console.log(`🔨 Extracted: requestId=${requestId}, renovatorId=${renovatorId}, customerId=${customerId}`);
  
  if (action === 'connect') {
    // Customer accepting the match
    console.log(`✅ Customer ${customerId} accepting renovator ${renovatorId}`);
    
    // Record customer acceptance (skip if database fails)
    try {
      await recordCustomerAcceptance(requestId, customerId, renovatorId);
    } catch (error) {
      console.warn(`⚠️ Database error (continuing anyway): ${error.message}`);
    }
    
    // Confirm to customer
    await sendTelegramMessage(
      message.chat.id,
      `✅ <b>Great!</b> You've accepted this match.\n\n📞 The renovator will be notified and you'll receive their contact details once they confirm!`,
      { parse_mode: 'HTML' }
    );
    
    // Notify renovator with Accept/Decline buttons
    console.log(`📢 Notifying renovator ${renovatorId} about match acceptance`);
    await sendTelegramMessage(
      renovatorId,
      `🎉 <b>New Match!</b>\n\nA customer has accepted your match!\n\n✅ Click "Accept" to confirm and exchange contact details.`,
      { 
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Accept', callback_data: `reno_accept:${fullMatchId}` },
              { text: '❌ Decline', callback_data: `reno_decline:${fullMatchId}` },
            ],
          ],
        }
      }
    );
    
  } else if (action === 'skip') {
    // Customer skipping this match
    await sendTelegramMessage(
      message.chat.id,
      `⏭️ <b>Skipped!</b> Looking for the next match...`,
      { parse_mode: 'HTML' }
    );
    
  } else if (action === 'accept') {
    // Renovator accepting the match
    console.log(`✅ Renovator ${from.id} accepting match ${fullMatchId}`);
    
    // We already have the customer ID from the button data parsing
    const customerIdForRenovator = customerId;
    console.log(`✅ Using customer ID from button data: ${customerIdForRenovator}`);
    
    // Record renovator acceptance (skip if database fails)
    let acceptResult = { success: true, bothAccepted: true }; // Assume both accepted if DB is down
    try {
      acceptResult = await recordRenovatorAcceptance(requestId, customerIdForRenovator, from.id);
    } catch (error) {
      console.warn(`⚠️ Database error recording acceptance (continuing anyway): ${error.message}`);
    }
    
    console.log(`🎉 Both parties accepted! Exchanging contact details`);
    
    // Get contact details
    const contactsResult = await getRenovationMatchContacts(customerIdForRenovator, from.id);
    
    if (contactsResult.success) {
      // Send contact details to renovator
      const renovatorMsg = formatRenovatorContactMessage(contactsResult.customer);
      await sendTelegramMessage(
        from.id,
        renovatorMsg,
        { parse_mode: 'HTML' }
      );
      
      // Send contact details to customer
      const customerMsg = formatCustomerContactMessage(contactsResult.renovator);
      await sendTelegramMessage(
        customerIdForRenovator,
        customerMsg,
        { parse_mode: 'HTML' }
      );
      
      console.log(`✅ Contact details exchanged between ${customerIdForRenovator} and ${from.id}`);
    } else {
      // Fallback: just confirm acceptance
      await sendTelegramMessage(
        from.id,
        `✅ <b>Perfect!</b> You've accepted this match.\n\n📞 Contact details are being prepared...`,
        { parse_mode: 'HTML' }
      );
    }
    
  } else if (action === 'decline') {
    // Renovator declining the match
    console.log(`❌ Renovator ${from.id} declining match ${fullMatchId}`);
    
    const customerIdForRenovator = customerId;
    
    await sendTelegramMessage(
      message.chat.id,
      `❌ <b>Declined.</b> Let me know if you'd like to see other options!`,
      { parse_mode: 'HTML' }
    );
    
    // Notify the customer
    await sendTelegramMessage(
      customerIdForRenovator,
      `⏭️ The renovator isn't available for this project. Let me find you another match!`,
      { parse_mode: 'HTML' }
    );
  }
}
