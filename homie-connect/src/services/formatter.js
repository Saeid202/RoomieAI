// Match card formatter — renders differently per channel
// PRIVACY RULE: Never expose name, email, or phone until status = 'matched'

// Anonymised display label for a match
function matchLabel(match, index = 1) {
  const score = match.score ? ` · ${match.score}% match` : '';
  return `Match #${index}${score}`;
}

// Format match for Telegram (HTML + inline buttons)
export function formatMatchTelegram(match, intent, index = 1) {
  const label = matchLabel(match, index);
  let text = `<b>${label}</b>\n\n`;

  if (intent === 'ROOMMATE') {
    text += `💰 Budget: $${match.budget_min ?? 'N/A'}–$${match.budget_max ?? 'N/A'}/mo\n`;
    if (match.profile_completeness) text += `📋 Profile: ${match.profile_completeness}% complete\n`;
  } else if (intent === 'COBUY') {
    text += `💰 Budget: $${match.budget_min ?? 'N/A'}–$${match.budget_max ?? 'N/A'}\n`;
    if (match.down_payment) text += `🏦 Down payment: $${match.down_payment}\n`;
    if (match.profile_completeness) text += `📋 Profile: ${match.profile_completeness}% complete\n`;
  } else if (intent === 'EXPERT') {
    text += `🎓 Specialization: ${match.specialization ?? 'N/A'}\n`;
    text += `📍 City: ${match.city ?? 'N/A'}\n`;
    text += `📅 Available this week: ${match.available_this_week ? 'Yes' : 'No'}\n`;
  } else if (intent === 'RENOVATION') {
    text += `🔧 Services: ${match.services?.join(', ') ?? 'N/A'}\n`;
    if (match.isEmergency) text += `🚨 Emergency available\n`;
    if (match.profile_completeness) text += `📋 Profile: ${match.profile_completeness}% complete\n`;
  }

  text += `\n🔒 Contact details shared only after both parties confirm.`;

  return {
    text,
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Connect me', callback_data: `connect:${match.user_id}` }],
        [{ text: '👀 See more', callback_data: `more:${match.user_id}` }],
      ],
    },
  };
}

// Format match for WhatsApp (plain text + interactive buttons)
export function formatMatchWhatsApp(match, intent, index = 1) {
  const label = matchLabel(match, index);
  let text = `*${label}*\n\n`;

  if (intent === 'ROOMMATE') {
    text += `💰 Budget: $${match.budget_min ?? 'N/A'}–$${match.budget_max ?? 'N/A'}/mo\n`;
    if (match.profile_completeness) text += `📋 Profile: ${match.profile_completeness}% complete\n`;
  } else if (intent === 'COBUY') {
    text += `💰 Budget: $${match.budget_min ?? 'N/A'}–$${match.budget_max ?? 'N/A'}\n`;
    if (match.down_payment) text += `🏦 Down payment: $${match.down_payment}\n`;
    if (match.profile_completeness) text += `📋 Profile: ${match.profile_completeness}% complete\n`;
  } else if (intent === 'EXPERT') {
    text += `🎓 Specialization: ${match.specialization ?? 'N/A'}\n`;
    text += `📍 City: ${match.city ?? 'N/A'}\n`;
    text += `📅 Available this week: ${match.available_this_week ? 'Yes' : 'No'}\n`;
  } else if (intent === 'RENOVATION') {
    text += `🔧 Services: ${match.services?.join(', ') ?? 'N/A'}\n`;
    if (match.isEmergency) text += `🚨 Emergency available\n`;
    if (match.profile_completeness) text += `📋 Profile: ${match.profile_completeness}% complete\n`;
  }

  text += `\n🔒 Contact details shared only after both parties confirm.`;

  return {
    text,
    interactive: {
      type: 'button',
      body: { text },
      action: {
        buttons: [
          { type: 'reply', reply: { id: `connect:${match.user_id}`, title: '✅ Connect me' } },
          { type: 'reply', reply: { id: `more:${match.user_id}`, title: '👀 See more' } },
        ],
      },
    },
  };
}

// Format match for SMS (condensed plain text, no emojis for compatibility)
export function formatMatchSMS(match, intent, index = 1) {
  const score = match.score ? ` (${match.score}% match)` : '';
  let text = `Match #${index}${score}: `;

  if (intent === 'ROOMMATE') {
    text += `Budget $${match.budget_min ?? 'N/A'}-$${match.budget_max ?? 'N/A'}/mo`;
  } else if (intent === 'COBUY') {
    text += `Budget $${match.budget_min ?? 'N/A'}-$${match.budget_max ?? 'N/A'}`;
    if (match.down_payment) text += `, $${match.down_payment} saved`;
  } else if (intent === 'EXPERT') {
    text += `${match.specialization ?? 'Expert'}, ${match.city ?? 'N/A'}`;
  } else if (intent === 'RENOVATION') {
    text += match.services?.[0] ?? 'Renovator';
    if (match.isEmergency) text += ' (emergency available)';
  }

  text += `. Contact shared after both confirm. Reply YES to connect or NO to skip.`;
  return text;
}

// Format no match response
export function formatNoMatchResponse() {
  return "I don't have a match right now, but I've saved your criteria. I'll notify you the moment someone joins who fits.";
}

// Format emergency dispatch response
export function formatEmergencyDispatchResponse(count = 4) {
  return `🚨 Sending an emergency alert to ${count} verified renovators near your property right now. You'll hear back within 15 minutes.`;
}

// Format intro sent response
export function formatIntroSentResponse() {
  return "✅ Intro request sent! I'll notify you as soon as they respond. Contact details are shared only after both parties confirm.";
}

// Format match confirmed response (shown to both parties after double opt-in)
export function formatMatchConfirmedResponse() {
  return "🎉 It's a match! Both of you confirmed. Contact details are now shared — good luck!";
}

// Format decline response
export function formatDeclineResponse() {
  return "No worries! I'll keep looking for a better match for you.";
}
