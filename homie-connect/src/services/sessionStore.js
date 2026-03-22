import { createClient } from 'redis';

// Redis client for session storage
let redisClient = null;
let isRedisConnected = false;

// In-memory fallback for development
const memorySessions = new Map();

// Session TTL: 24 hours in seconds
const SESSION_TTL = 24 * 60 * 60;

// Maximum messages to keep in history
const MAX_MESSAGES = 20;

export async function connectRedis() {
  if (redisClient) return redisClient;
  
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      isRedisConnected = false;
    });
    
    redisClient.on('connect', () => {
      console.log('Connected to Redis');
      isRedisConnected = true;
    });
    
    await redisClient.connect();
    isRedisConnected = true;
    return redisClient;
  } catch (error) {
    console.warn('Redis connection failed, using in-memory fallback');
    isRedisConnected = false;
    return null;
  }
}

// Get session key
function getSessionKey(channel, userId) {
  return `homie:session:${channel}:${userId}`;
}

// Get session from Redis or memory
export async function getSession(channel, userId) {
  const key = getSessionKey(channel, userId);
  
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      if (data) {
        const session = JSON.parse(data);
        // Reset TTL on access
        await redisClient.expire(key, SESSION_TTL);
        return session;
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }
  }
  
  // Fallback to memory
  return memorySessions.get(key) || null;
}

// Save session to Redis or memory
export async function saveSession(channel, userId, session) {
  const key = getSessionKey(channel, userId);
  
  // Trim conversation to MAX_MESSAGES
  if (session.conversation && session.conversation.length > MAX_MESSAGES) {
    session.conversation = session.conversation.slice(-MAX_MESSAGES);
  }
  
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.setEx(key, SESSION_TTL, JSON.stringify(session));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  } else {
    // Fallback to memory
    memorySessions.set(key, session);
  }
}

// Delete session
export async function deleteSession(channel, userId) {
  const key = getSessionKey(channel, userId);
  
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  } else {
    memorySessions.delete(key);
  }
}

// Reset session (clear conversation but keep intent/answers)
export async function resetSession(channel, userId) {
  const session = await getSession(channel, userId);
  if (session) {
    session.conversation = [];
    session.messageCount = 0;
    await saveSession(channel, userId, session);
  }
  return session;
}

// Initialize session for new user
export async function createSession(channel, userId, intent = null) {
  const session = {
    userId,
    channel,
    intent,
    renovationRole: null, // For renovation intent: 'provider' or 'seeker'
    answers: {},
    conversation: [],
    messageCount: 0,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
  await saveSession(channel, userId, session);
  return session;
}

// Check if session is expired
export function isSessionExpired(session) {
  if (!session) return true;
  const now = new Date();
  const createdAt = new Date(session.createdAt);
  const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);
  return hoursElapsed > 24;
}
