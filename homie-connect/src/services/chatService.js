import { query } from './homieDB.js';

const MAX_MESSAGE_LENGTH = 2000;

/**
 * Send a message in a matched chat thread.
 * Validates that the sender is one of the two matched parties.
 */
export async function sendMessage(senderId, matchRequestId, message) {
  if (!message || message.trim().length === 0) {
    return { success: false, error: 'Message cannot be empty' };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { success: false, error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` };
  }

  // Verify the match is confirmed and sender is a party
  const matchResult = await query(`
    SELECT id, user_id, match_user_id
    FROM match_requests
    WHERE id = $1
      AND status = 'matched'
      AND (user_id = $2 OR match_user_id = $2)
  `, [matchRequestId, String(senderId)]);

  if (matchResult.rows.length === 0) {
    return { success: false, error: 'Match not found, not confirmed, or sender is not a party' };
  }

  const result = await query(`
    INSERT INTO chat_messages (match_request_id, sender_id, message)
    VALUES ($1, $2, $3)
    RETURNING id, match_request_id, sender_id, message, created_at
  `, [matchRequestId, String(senderId), message.trim()]);

  return { success: true, message: result.rows[0] };
}

/**
 * Fetch message history for a matched chat thread.
 * Validates that the requester is one of the two matched parties.
 */
export async function getMessages(requestingUserId, matchRequestId, { limit = 50, before } = {}) {
  // Verify access
  const matchResult = await query(`
    SELECT id FROM match_requests
    WHERE id = $1
      AND status = 'matched'
      AND (user_id = $2 OR match_user_id = $2)
  `, [matchRequestId, String(requestingUserId)]);

  if (matchResult.rows.length === 0) {
    return { success: false, error: 'Match not found or access denied' };
  }

  const params = [matchRequestId, Math.min(limit, 100)];
  let cursorClause = '';

  if (before) {
    params.push(before);
    cursorClause = `AND created_at < $${params.length}`;
  }

  const result = await query(`
    SELECT id, sender_id, message, created_at
    FROM chat_messages
    WHERE match_request_id = $1
      ${cursorClause}
    ORDER BY created_at DESC
    LIMIT $2
  `, params);

  return {
    success: true,
    messages: result.rows.reverse(), // chronological order
    hasMore: result.rows.length === Math.min(limit, 100),
  };
}
