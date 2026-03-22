import { query } from './homieDB.js';

// Notification service - sends alerts via FCM, Telegram, and SMS

// Send FCM push notification
async function sendFCMNotification(userId, title, body, data = {}) {
  try {
    // Get user's FCM token
    const result = await query(`
      SELECT fcm_token, preferred_channel, telegram_chat_id, phone
      FROM auth.users
      WHERE id = $1
    `, [userId]);
    
    if (!result.rows[0]) return { success: false, error: 'User not found' };
    
    const user = result.rows[0];
    
    // Send FCM push
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: user.fcm_token,
        notification: {
          title,
          body,
        },
        data,
      }),
    });
    
    if (!response.ok) {
      console.error('FCM send failed:', await response.text());
      return { success: false, error: 'FCM send failed' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('FCM notification error:', error);
    return { success: false, error: error.message };
  }
}

// Send Telegram message
async function sendTelegramNotification(chatId, message) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );
    
    if (!response.ok) {
      console.error('Telegram send failed:', await response.text());
      return { success: false, error: 'Telegram send failed' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Telegram notification error:', error);
    return { success: false, error: error.message };
  }
}

// Send SMS via Twilio
async function sendSMSNotification(phone, message) {
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
          To: phone,
          Body: message,
        }),
      }
    );
    
    if (!response.ok) {
      console.error('SMS send failed:', await response.text());
      return { success: false, error: 'SMS send failed' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('SMS notification error:', error);
    return { success: false, error: error.message };
  }
}

// Send notification to user via their preferred channel
export async function sendNotification(userId, title, body, data = {}) {
  try {
    // Get user's notification preferences
    const result = await query(`
      SELECT fcm_token, preferred_channel, telegram_chat_id, phone
      FROM auth.users
      WHERE id = $1
    `, [userId]);
    
    if (!result.rows[0]) return { success: false, error: 'User not found' };
    
    const user = result.rows[0];
    const notifications = [];
    
    // Send via preferred channel
    if (user.preferred_channel === 'telegram' && user.telegram_chat_id) {
      notifications.push(await sendTelegramNotification(user.telegram_chat_id, `${title}: ${body}`));
    } else if (user.preferred_channel === 'sms' && user.phone) {
      notifications.push(await sendSMSNotification(user.phone, `${title}: ${body}`));
    }
    
    // Always send FCM push
    notifications.push(await sendFCMNotification(userId, title, body, data));
    
    return {
      success: notifications.some(n => n.success),
      notifications,
    };
  } catch (error) {
    console.error('Notification error:', error);
    return { success: false, error: error.message };
  }
}

// Send emergency dispatch to multiple renovators
export async function sendEmergencyDispatch(renovatorIds, address) {
  const notifications = [];
  
  for (const renovatorId of renovatorIds) {
    // Get renovator's contact info
    const result = await query(`
      SELECT fcm_token, phone, preferred_channel, telegram_chat_id
      FROM auth.users
      WHERE id = $1
    `, [renovatorId]);
    
    if (!result.rows[0]) continue;
    
    const renovator = result.rows[0];
    
    // Send FCM push
    notifications.push(await sendFCMNotification(
      renovatorId,
      '🚨 Emergency Renovation Request',
      `New emergency at: ${address}`,
      { type: 'emergency_renovation', address }
    ));
    
    // Send SMS if phone available
    if (renovator.phone) {
      notifications.push(await sendSMSNotification(
        renovator.phone,
        `🚨 EMERGENCY: New renovation request at ${address}. Please respond immediately.`
      ));
    }
  }
  
  return {
    success: notifications.some(n => n.success),
    notifications,
  };
}

// Send intro request to matched user
export async function sendIntroRequest(matchUserId, requesterId, requesterName) {
  try {
    // Get requester's profile info
    const result = await query(`
      SELECT first_name, last_name, email
      FROM auth.users
      WHERE id = $1
    `, [requesterId]);
    
    if (!result.rows[0]) return { success: false, error: 'Requester not found' };
    
    const requester = result.rows[0];
    
    // Send notification
    return await sendNotification(
      matchUserId,
      'New Match Introduction',
      `${requester.first_name} ${requester.last_name} wants to connect with you`,
      {
        type: 'intro_request',
        requester_id: requesterId,
        requester_name: `${requester.first_name} ${requester.last_name}`,
      }
    );
  } catch (error) {
    console.error('Intro request error:', error);
    return { success: false, error: error.message };
  }
}

// Send match accepted notification to both parties
export async function sendMatchAcceptedNotification(userAId, userBId) {
  try {
    // Get user profiles
    const resultA = await query(`
      SELECT first_name, last_name, email
      FROM auth.users
      WHERE id = $1
    `, [userAId]);
    
    const resultB = await query(`
      SELECT first_name, last_name, email
      FROM auth.users
      WHERE id = $1
    `, [userBId]);
    
    if (!resultA.rows[0] || !resultB.rows[0]) {
      return { success: false, error: 'User not found' };
    }
    
    const userA = resultA.rows[0];
    const userB = resultB.rows[0];
    
    // Send to both parties
    const notificationA = await sendNotification(
      userAId,
      'Match Confirmed!',
      `You and ${userB.first_name} have both confirmed. Opening a chat thread now.`,
      { type: 'match_accepted', match_user_id: userBId }
    );
    
    const notificationB = await sendNotification(
      userBId,
      'Match Confirmed!',
      `You and ${userA.first_name} have both confirmed. Opening a chat thread now.`,
      { type: 'match_accepted', match_user_id: userAId }
    );
    
    return {
      success: notificationA.success && notificationB.success,
      notifications: [notificationA, notificationB],
    };
  } catch (error) {
    console.error('Match accepted notification error:', error);
    return { success: false, error: error.message };
  }
}

// Send decline notification
export async function sendDeclineNotification(requesterId, matchUserId) {
  try {
    // Get match user's name
    const result = await query(`
      SELECT first_name, last_name
      FROM auth.users
      WHERE id = $1
    `, [matchUserId]);
    
    const matchUser = result.rows[0];
    
    return await sendNotification(
      requesterId,
      'Match Not Available',
      `${matchUser?.first_name || 'This user'} wasn't available. Finding more matches...`,
      { type: 'match_declined', match_user_id: matchUserId }
    );
  } catch (error) {
    console.error('Decline notification error:', error);
    return { success: false, error: error.message };
  }
}
