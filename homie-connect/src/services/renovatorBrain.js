import { getSession, saveSession, createSession, deleteSession, isSessionExpired } from './sessionStore.js';
import { cacheSeeker } from './inMemoryMatchingCache.js';
import {
  detectRenovationRole,
  getProviderQuestions,
  getSeekerQuestions,
  buildProviderProfile,
  buildCustomerRequest,
  updateProviderProfile,
  createRenovationRequest,
  findRenovationMatches,
  createRenovationMatch,
} from './renovatorMatchingEngine.js';

/**
 * Enhanced generateResponse for renovation intent
 * Handles both provider and seeker flows
 */
export async function generateRenovationResponse(channel, userId, userMessage, callGemini) {
  console.log(`\n🏗️ generateRenovationResponse called for user ${userId}`);

  // Get or create session
  let session = await getSession(channel, userId);
  console.log(`📊 Existing session: ${session ? 'YES' : 'NO'}`);

  if (session && isSessionExpired(session)) {
    console.log(`⏰ Session expired, deleting`);
    await deleteSession(channel, userId);
    session = null;
  }

  // Always detect role from current message to handle role switches
  let detectedRole = detectRenovationRole(userMessage);
  console.log(`🔍 Role detection: "${userMessage.substring(0, 50)}" → ${detectedRole}`);

  if (!session) {
    // Create new session with detected role
    console.log(`✨ Creating NEW session with role: ${detectedRole}`);
    session = await createSession(channel, userId, 'RENOVATION');
    session.renovationRole = detectedRole; // 'provider' or 'seeker'
    console.log(`📝 New session created with role: ${detectedRole}`);
  } else if (detectedRole && detectedRole !== session.renovationRole) {
    // Only switch roles if there's EXPLICIT seeker language (not just a city name)
    const lower = userMessage.toLowerCase();
    const explicitSeekerKeywords = ['looking for', 'need', 'find', 'help me', 'i need a', 'contact in your network', 'any contact'];
    const hasExplicitSeekerLanguage = explicitSeekerKeywords.some(kw => lower.includes(kw));
    
    if (hasExplicitSeekerLanguage) {
      // Clear role switch - user explicitly said they're a seeker
      console.log(`🔄 EXPLICIT ROLE CHANGE: User said "${userMessage.substring(0, 50)}", switching from ${session.renovationRole} to ${detectedRole}`);
      await deleteSession(channel, userId);
      session = await createSession(channel, userId, 'RENOVATION');
      session.renovationRole = detectedRole;
      session.answers = {}; // CLEAR ALL ANSWERS
      console.log(`✨ Session reset with new role: ${detectedRole}`);
    } else {
      // Just a city name or ambiguous - keep existing role
      console.log(`⚠️ Detected role ${detectedRole} but no explicit language, keeping existing role: ${session.renovationRole}`);
      detectedRole = null; // Don't use this detection
    }
  }

  const role = session.renovationRole;
  console.log(`👤 Current role: ${role}`);

  if (!role) {
    // Still no role - ask for clarification
    console.log(`❌ No role detected and no existing role, asking for clarification`);
    const clarification = "Are you a renovator looking to find customers, or a customer looking for a renovator?";
    session.conversation.push({ role: 'assistant', content: clarification });
    await saveSession(channel, userId, session);
    return {
      responseText: clarification,
      matchReady: null,
    };
  }

  const questions = role === 'provider' ? getProviderQuestions() : getSeekerQuestions();
  console.log(`❓ Questions for ${role}: ${questions.keys.join(', ')}`);

  // Save the user's answer to the current question
  const answeredCount = questions.keys.filter(k => session.answers[k] !== undefined).length;
  console.log(`📊 Progress: ${answeredCount}/${questions.keys.length} questions answered`);

  if (answeredCount < questions.keys.length) {
    const currentKey = questions.keys[answeredCount];
    session.answers[currentKey] = userMessage;
    console.log(`💾 Saved answer for: ${currentKey}`);

    // Emergency shortcut for seekers
    if (role === 'seeker' && isEmergencyRenovation(session.answers)) {
      session.conversation.push({ role: 'user', content: userMessage });
      session.messageCount++;
      session.lastActive = new Date().toISOString();
      await saveSession(channel, userId, session);

      const matchReady = {
        intent: 'RENOVATION',
        role: 'seeker',
        emergency: true,
        answers: buildCustomerRequest(userId, session.answers),
      };

      return {
        responseText: '🚨 Sending an emergency alert to 4 verified renovators near your property right now. You\'ll hear back within 15 minutes.',
        matchReady,
      };
    }
    
    // NEW: For seekers, if we have address, skip to matching immediately
    // (We simplified seeker flow to only ask for address)
    if (role === 'seeker' && session.answers.address && answeredCount >= questions.keys.length) {
      console.log(`⚡ SEEKER SHORTCUT: Have address, skipping to matching`);
      session.conversation.push({ role: 'user', content: userMessage });
      session.messageCount++;
      session.lastActive = new Date().toISOString();
      await saveSession(channel, userId, session);
      
      // Skip remaining questions and go straight to matching
      const requestData = buildCustomerRequest(userId, session.answers);
      // Add Telegram username to request
      requestData.telegramUsername = session.telegramUsername || null;
      
      // Cache the seeker request in memory
      cacheSeeker(userId, requestData);
      
      try {
        const requestId = await createRenovationRequest(userId, requestData);
        
        if (requestId) {
          const matches = await findRenovationMatches(requestId, 3, requestData);
          
          if (matches.length > 0) {
            console.log(`⚡ Found ${matches.length} matches via shortcut`);
            
            for (const match of matches) {
              await createRenovationMatch(requestId, match.user_id, userId, match.score, 'Shortcut match');
            }
            
            // Include request_id in answers for button callbacks
            const answersWithId = { ...requestData, request_id: requestId };
            
            return {
              responseText: `Found ${matches.length} great renovators. Sending the top match now — both sides confirm before I share any details.`,
              matchReady: {
                intent: 'RENOVATION',
                role: 'seeker',
                emergency: requestData.emergency,
                answers: answersWithId,
                matches,
              },
            };
          }
        }
      } catch (error) {
        console.error('⚡ Shortcut matching error:', error.message);
        // Graceful fallback - return matchReady with empty matches so frontend can handle it
        return {
          responseText: "I've saved your request. I'm having trouble connecting to find matches right now, but I'll notify you when renovators in your area are available.",
          matchReady: {
            intent: 'RENOVATION',
            role: 'seeker',
            emergency: requestData.emergency,
            answers: requestData,
            matches: [],
          },
        };
      }
    }
  }

  // Add user message to conversation history
  session.conversation.push({ role: 'user', content: userMessage });
  session.messageCount++;
  session.lastActive = new Date().toISOString();

  // Check if all answers are collected
  const allAnswered = questions.keys.every(k => session.answers[k] !== undefined);

  if (allAnswered) {
    console.log(`✅ All questions answered for ${role}`);
    await saveSession(channel, userId, session);

    if (role === 'provider') {
      // Provider registration complete
      const profileData = buildProviderProfile(session.answers);
      // Add Telegram username to profile
      profileData.telegramUsername = session.telegramUsername || null;
      console.log(`💾 Saving provider profile for user ${userId}:`, profileData);
      const saved = await updateProviderProfile(userId, profileData);
      console.log(`✅ Provider profile saved: ${saved}`);

      return {
        responseText: `✅ You're now visible to customers in ${session.answers.serviceArea} looking for ${session.answers.services}. You'll get notified when someone matches!`,
        matchReady: {
          intent: 'RENOVATION',
          role: 'provider',
          answers: profileData,
        },
      };
    } else {
      // Seeker - find matches
      const requestData = buildCustomerRequest(userId, session.answers);
      // Add Telegram username to request
      requestData.telegramUsername = session.telegramUsername || null;
      
      // Cache the seeker request in memory
      cacheSeeker(userId, requestData);
      
      try {
        const requestId = await createRenovationRequest(userId, requestData);

        if (requestId) {
          const matches = await findRenovationMatches(requestId, 3, requestData);

          if (matches.length > 0) {
            // Create match records
            for (const match of matches) {
              await createRenovationMatch(requestId, match.user_id, userId, match.score, 'Automated match');
            }

            // Include request_id in answers for button callbacks
            const answersWithId = { ...requestData, request_id: requestId };

            return {
              responseText: `Found ${matches.length} great renovators in your area. Sending the top match now — both sides confirm before I share any details.`,
              matchReady: {
                intent: 'RENOVATION',
                role: 'seeker',
                emergency: requestData.emergency,
                answers: answersWithId,
                matches,
              },
            };
          } else {
            return {
              responseText: "I don't have a match right now, but I've saved your criteria. I'll notify you the moment someone joins who fits.",
              matchReady: null,
            };
          }
        } else {
          // requestId is null - database insert failed silently
          console.error('❌ Failed to create renovation request - requestId is null');
          return {
            responseText: "I'm having trouble saving your request right now. Please try again in a moment.",
            matchReady: {
              intent: 'RENOVATION',
              role: 'seeker',
              emergency: requestData.emergency,
              answers: requestData,
              matches: [],
            },
          };
        }
      } catch (dbError) {
        console.error('❌ Database error creating request:', dbError.message);
        // Graceful fallback - still return matchReady with answers so frontend can handle it
        return {
          responseText: "I'm having trouble connecting to the database right now, but I've saved your request. Please try again in a moment.",
          matchReady: {
            intent: 'RENOVATION',
            role: 'seeker',
            emergency: requestData.emergency,
            answers: requestData,
            matches: [],
          },
        };
      }
    }
  }

  // Not enough answers yet — ask next question
  if (questions.keys.length > 0) {
    const nextQuestion = questions.text[answeredCount];
    console.log(`❓ Asking question ${answeredCount + 1}/${questions.keys.length}`);

    session.conversation.push({ role: 'assistant', content: nextQuestion });
    await saveSession(channel, userId, session);

    return {
      responseText: nextQuestion,
      matchReady: null,
    };
  }

  // Fallback: ask for clarification
  const clarification = role === 'provider'
    ? "Are you a renovator looking to find customers, or a customer looking for a renovator?"
    : "I'm not sure if you're looking for a renovator or offering services. Can you clarify?";

  console.log(`⚠️ Fallback clarification (role: ${role})`);
  session.conversation.push({ role: 'assistant', content: clarification });
  await saveSession(channel, userId, session);

  return {
    responseText: clarification,
    matchReady: null,
  };
}


/**
 * Check if this is an emergency renovation
 */
function isEmergencyRenovation(answers) {
  if (!answers.isEmergency) return false;
  const lower = answers.isEmergency.toLowerCase();
  return lower.includes('yes') || lower.includes('emergency') || lower.includes('urgent');
}

/**
 * Get renovation session status
 */
export async function getRenovationSessionStatus(channel, userId) {
  const session = await getSession(channel, userId);
  
  if (!session) {
    return { status: 'no_session' };
  }

  if (isSessionExpired(session)) {
    return { status: 'expired' };
  }

  const role = session.renovationRole;
  const questions = role === 'provider' ? getProviderQuestions() : getSeekerQuestions();
  const answeredCount = questions.keys.filter(k => session.answers[k] !== undefined).length;
  const totalQuestions = questions.keys.length;

  return {
    status: 'active',
    role,
    progress: `${answeredCount}/${totalQuestions}`,
    answers: session.answers,
    messageCount: session.messageCount,
  };
}

/**
 * Reset renovation session
 */
export async function resetRenovationSession(channel, userId) {
  await deleteSession(channel, userId);
  return { status: 'reset' };
}
