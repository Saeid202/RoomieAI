import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSession, saveSession, createSession, deleteSession, isSessionExpired } from './sessionStore.js';
import { generateRenovationResponse } from './renovatorBrain.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callGemini(systemPrompt, messages, maxTokens = 256) {
  try {
    console.log('🔌 Calling Gemini API with model: gemini-2.5-flash');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Convert conversation history to Gemini format
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1].content;
    console.log('📤 Sending message to Gemini:', lastMessage.substring(0, 50));
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();
    console.log('📥 Gemini response received:', responseText.substring(0, 100));
    return responseText;
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    console.error('Error code:', error.code);
    // Fallback: return a generic response
    return "I'm having trouble connecting to my AI brain right now. Can you tell me more about what you're looking for?";
  }
}

const SYSTEM_PROMPT = `You are Homie, an AI-powered connector for HomieAI — a Canadian real estate platform that unifies the entire housing journey.

Your role: Help users find the right person to connect with based on what they need. You handle 4 types of connections:
1. ROOMMATE — Find someone to share a rental with
2. COBUY — Find a co-buyer to buy property together
3. EXPERT — Connect with a lawyer, mortgage broker, or other professional
4. RENOVATION — Find a contractor for repairs (normal or emergency)

Rules:
- Ask MAX 1 question per message — never 2 at once
- Keep messages short and friendly (this is chat/SMS, not email)
- Be warm and helpful, not robotic
- Never share names, phone numbers, or profile details — only after double opt-in
- If the user's intent is unclear, ask: "What are you looking for today?"

Question flows (ask in order, one at a time):

ROOMMATE:
1. What area are you looking to live in?
2. What's your monthly rent budget?
3. Early riser or night owl? Work from home?
4. Any dealbreakers — pets, smoking, guests?
After 4 answers: emit MATCH_READY

COBUY:
1. What city are you targeting?
2. What price range are you thinking?
3. How much have you saved for a down payment?
4. Planning to live in it or use as investment?
After 4 answers: emit MATCH_READY

EXPERT:
1. Do you need a lawyer, mortgage broker, or both?
2. What city is the property in?
3. Is this for a closing, co-ownership agreement, or something else?
After 3 answers: emit MATCH_READY

RENOVATION:
1. Is this an emergency — active damage right now? (if YES → emit MATCH_READY immediately)
2. Which property address is this for?
3. What type of work is needed?
After 3 answers (or emergency): emit MATCH_READY

MATCH_READY signal format (on its own line in the response):
MATCH_READY:{"intent":"roommate","emergency":false,"answers":{...}}

After emitting MATCH_READY, send a natural follow-up like:
"I found 2 great matches for you. Sending the top one now — both sides confirm before I share any details."

If no match found: "I don't have a match right now, but I've saved your criteria. I'll notify you the moment someone joins who fits."

Emergency dispatch: "🚨 Sending an emergency alert to 4 verified renovators near your property right now. You'll hear back within 15 minutes."

Always end with: "Both parties confirm before contact details are shared."`;

// Intent detection keywords
const INTENT_KEYWORDS = {
  RENOVATION: ['pipe burst', 'leak', 'broken', 'emergency', 'damage', 'repair', 'fix', 'plumbing', 'electrical', 'hvac'],
  COBUY: ["can't afford alone", 'co-buy', 'partner to buy', 'co-ownership', 'joint purchase', 'buy together'],
  ROOMMATE: ['roommate', 'co-liver', 'share a place', 'rent a room', 'find a roommate', 'roommate wanted'],
  EXPERT: ['lawyer', 'broker', 'mortgage', 'closing', 'legal', 'conveyancer', 'notary'],
};

// Ordered question keys per intent — used as answer map keys
const QUESTIONS = {
  ROOMMATE: ['area', 'budget', 'schedule', 'dealbreakers'],
  COBUY: ['city', 'priceRange', 'downPayment', 'purpose'],
  EXPERT: ['expertType', 'city', 'purpose'],
  RENOVATION: ['isEmergency', 'address', 'workType'],
};

// Human-readable question text per intent (parallel to QUESTIONS keys)
const QUESTION_TEXT = {
  ROOMMATE: [
    'What area are you looking to live in?',
    "What's your monthly rent budget?",
    'Early riser or night owl? Work from home?',
    'Any dealbreakers — pets, smoking, guests?',
  ],
  COBUY: [
    'What city are you targeting?',
    'What price range are you thinking?',
    'How much have you saved for a down payment?',
    'Planning to live in it or use as investment?',
  ],
  EXPERT: [
    'Do you need a lawyer, mortgage broker, or both?',
    'What city is the property in?',
    'Is this for a closing, co-ownership agreement, or something else?',
  ],
  RENOVATION: [
    'Is this an emergency — active damage right now?',
    'Which property address is this for?',
    'What type of work is needed?',
  ],
};

function detectIntent(message) {
  const lower = message.toLowerCase();
  if (lower.includes('emergency') || lower.includes('burst') || lower.includes('leak') || lower.includes('damage')) {
    return 'RENOVATION';
  }
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return intent;
    }
  }
  return null;
}

// Returns the next unanswered question index for the given intent
function nextQuestionIndex(intent, answers) {
  const keys = QUESTIONS[intent] || [];
  return keys.findIndex(k => answers[k] === undefined);
}

// Build structured answers object from session for matchingEngine
function buildAnswers(intent, answers) {
  const keys = QUESTIONS[intent] || [];
  const result = {};
  for (const k of keys) {
    result[k] = answers[k] ?? null;
  }
  return result;
}

// Check if emergency renovation — isEmergency answer is "yes"
function isEmergencyRenovation(intent, answers) {
  return intent === 'RENOVATION' && /^yes$/i.test(answers.isEmergency || '');
}

// Generate response using Claude
export async function generateResponse(channel, userId, userMessage) {
  console.log(`\n🔍 generateResponse called for user ${userId}`);
  console.log(`📝 Message: "${userMessage.substring(0, 60)}..."`);
  
  // Get existing session first to check if we're in a renovation flow
  let existingSession = await getSession(channel, userId);
  
  // Check if this is a renovation message - more comprehensive detection
  const lower = userMessage.toLowerCase();
  let isRenovationMessage = 
      lower.includes('renovator') || 
      lower.includes('renovation') ||
      lower.includes('repair') ||
      lower.includes('plumb') ||
      lower.includes('electric') ||
      lower.includes('looking for') ||
      lower.includes('need') ||
      lower.includes('find') ||
      lower.includes('contractor') ||
      lower.includes('handyman') ||
      lower.includes('carpenter') ||
      lower.includes('hvac') ||
      lower.includes('roof') ||
      lower.includes('paint') ||
      lower.includes('tile') ||
      lower.includes('burst') ||
      lower.includes('leak') ||
      lower.includes('damage') ||
      lower.includes('broken') ||
      lower.includes('emergency') ||
      lower.includes('urgent') ||
      lower.includes('asap') ||
      lower.includes('general'); // Add "general" as renovation keyword
  
  // NEW: If we have an existing renovation session, treat any message as renovation
  if (existingSession && existingSession.intent === 'RENOVATION') {
    console.log(`📌 Existing RENOVATION session detected, treating as renovation message`);
    isRenovationMessage = true;
  }
  
  console.log(`🏗️ Is renovation message: ${isRenovationMessage}`);
  
  if (isRenovationMessage) {
    console.log(`✅ Routing to generateRenovationResponse`);
    return await generateRenovationResponse(channel, userId, userMessage, callGemini);
  }

  console.log(`❌ Not a renovation message, using old flow`);
  
  // Use existing session or create new one
  let session = existingSession;

  if (session && isSessionExpired(session)) {
    console.log(`⏰ Session expired, deleting`);
    await deleteSession(channel, userId);
    session = null;
  }

  if (!session) {
    const intent = detectIntent(userMessage);
    console.log(`📋 Creating new session with intent: ${intent}`);
    session = await createSession(channel, userId, intent);
  }

  // Persist intent if it was detected now but not on session creation
  if (!session.intent) {
    session.intent = detectIntent(userMessage);
  }

  const intent = session.intent;
  console.log(`🎯 Current intent: ${intent}`);

  // Route to renovation handler if intent is RENOVATION
  if (intent === 'RENOVATION') {
    console.log(`✅ Intent is RENOVATION, routing to generateRenovationResponse`);
    return await generateRenovationResponse(channel, userId, userMessage, callGemini);
  }

  // --- Save the user's answer to the PREVIOUS question before processing ---
  // The previous question is the one at index (answeredCount) before this message
  if (intent) {
    const keys = QUESTIONS[intent] || [];
    const answeredCount = keys.filter(k => session.answers[k] !== undefined).length;
    if (answeredCount < keys.length) {
      const currentKey = keys[answeredCount];
      session.answers[currentKey] = userMessage;

      // Emergency shortcut: if RENOVATION and user just answered isEmergency = yes → fire immediately
      if (isEmergencyRenovation(intent, session.answers)) {
        session.conversation.push({ role: 'user', content: userMessage });
        session.messageCount++;
        session.lastActive = new Date().toISOString();
        await saveSession(channel, userId, session);

        const matchReady = {
          intent,
          emergency: true,
          answers: buildAnswers(intent, session.answers),
        };
        return {
          responseText: '🚨 Sending an emergency alert to 4 verified renovators near your property right now. You\'ll hear back within 15 minutes.',
          matchReady,
        };
      }
    }
  }

  // Add user message to conversation history
  session.conversation.push({ role: 'user', content: userMessage });
  session.messageCount++;
  session.lastActive = new Date().toISOString();

  // Check if all answers are collected
  if (intent) {
    const keys = QUESTIONS[intent] || [];
    const allAnswered = keys.every(k => session.answers[k] !== undefined);

    if (allAnswered) {
      await saveSession(channel, userId, session);

      const matchReady = {
        intent,
        emergency: isEmergencyRenovation(intent, session.answers),
        answers: buildAnswers(intent, session.answers),
      };

      // Ask Gemini for a natural confirmation message only
      const confirmText = await callGemini(SYSTEM_PROMPT, [
        ...session.conversation,
        {
          role: 'user',
          content: 'I have all the info I need. Give me a short, warm confirmation that you\'re finding matches now.',
        },
      ]);

      return {
        responseText: confirmText,
        matchReady,
      };
    }
  }

  // Not enough answers yet — ask Gemini to ask the next question naturally
  const responseText = await callGemini(SYSTEM_PROMPT, session.conversation);

  // Persist intent if Claude inferred it (update session if still null)
  if (!session.intent && intent) {
    session.intent = intent;
  }

  await saveSession(channel, userId, session);

  return { responseText, matchReady: null };
}

// Reset session
export async function resetSession(channel, userId) {
  await deleteSession(channel, userId);
  return await createSession(channel, userId);
}

// Get session status
export async function getSessionStatus(channel, userId) {
  const session = await getSession(channel, userId);
  if (!session) return { exists: false };

  return {
    exists: true,
    intent: session.intent,
    answers: session.answers,
    messageCount: session.messageCount,
    conversationLength: session.conversation.length,
    isExpired: isSessionExpired(session),
  };
}
