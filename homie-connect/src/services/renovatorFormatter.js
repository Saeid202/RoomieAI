/**
 * Format renovation matches for Telegram display
 */

export function formatRenovatorCard(renovator, matchScore) {
  const stars = getStarRating(renovator.rating);
  const rateRange = renovator.hourly_rate_min && renovator.hourly_rate_max
    ? `$${renovator.hourly_rate_min}-${renovator.hourly_rate_max}/hr`
    : 'Rate on request';

  const services = renovator.services && renovator.services.length > 0
    ? renovator.services.join(', ')
    : 'General services';

  const availability = renovator.availability_start
    ? formatDate(renovator.availability_start)
    : 'ASAP';

  const jobsText = renovator.completed_jobs > 0
    ? `${renovator.completed_jobs} jobs completed`
    : 'New renovator';

  return `
🔧 <b>${renovator.name}</b>
${stars} ${renovator.rating ? renovator.rating.toFixed(1) : 'New'} • ${jobsText}

📋 Services: ${services}
⏰ Available: ${availability}
💰 ${rateRange}
⚡ Response: ${renovator.response_time_hours}hrs

Match Score: ${Math.round(matchScore)}/100
  `.trim();
}

export function formatRenovatorProfile(profile) {
  const stars = getStarRating(profile.rating);
  const services = profile.service_categories && profile.service_categories.length > 0
    ? profile.service_categories.join(', ')
    : 'General services';

  const rateRange = profile.hourly_rate_min && profile.hourly_rate_max
    ? `$${profile.hourly_rate_min}-${profile.hourly_rate_max}/hr`
    : 'Rate on request';

  return `
🔧 <b>${profile.name || 'Renovator'}</b>
${stars} ${profile.rating ? profile.rating.toFixed(1) : 'New'} • ${profile.completed_jobs || 0} jobs

📋 Services: ${services}
📍 Service Area: ${profile.city || 'Not specified'} (${profile.service_radius_km || 25}km radius)
⏰ Available: ${profile.availability_start ? formatDate(profile.availability_start) : 'ASAP'}
💰 ${rateRange}
⚡ Response Time: ${profile.response_time_hours || 24} hours
  `.trim();
}

export function formatCustomerRequest(request) {
  const timeline = request.timeline === 'urgent' ? '🚨 URGENT' : `📅 ${request.timeline}`;
  const budget = request.budget_min && request.budget_max
    ? `$${request.budget_min}-${request.budget_max}`
    : 'Budget TBD';

  return `
🏠 <b>Renovation Request</b>
📍 ${request.address}
🔨 Work: ${request.work_type}
${timeline}
💰 Budget: ${budget}
  `.trim();
}

export function formatMatchNotification(customer, renovator, matchScore) {
  return `
🎯 <b>New Match!</b>

Customer looking for: ${customer.work_type}
Location: ${customer.city}

Your match score: ${Math.round(matchScore)}/100

<b>Accept this match?</b>
  `.trim();
}

export function formatProviderRegistration(profile) {
  return `
✅ <b>You're now registered as a renovator!</b>

📋 Services: ${profile.service_categories.join(', ')}
📍 Service Area: ${profile.city} (${profile.service_radius_km}km radius)
⏰ Available: ${formatDate(profile.availability_start)}
💰 Rate: $${profile.hourly_rate_min}-${profile.hourly_rate_max}/hr
⚡ Response Time: ${profile.response_time_hours} hours

You'll get notified when customers match with you!
  `.trim();
}

export function formatMatchesFound(matches, count) {
  if (count === 0) {
    return `
❌ <b>No matches found</b>

I've saved your criteria. I'll notify you when a renovator joins who fits your needs!
    `.trim();
  }

  return `
✅ <b>Found ${count} renovator${count > 1 ? 's' : ''}!</b>

Showing the top match below. Both sides confirm before contact details are shared.
    `.trim();
}

export function formatEmergencyDispatch() {
  return `
🚨 <b>Emergency Alert Sent!</b>

I'm sending your request to 4 verified emergency renovators in your area right now.

You should hear back within 15 minutes.

Both sides confirm before contact details are shared.
  `.trim();
}

export function getMatchButtons(matchId, role) {
  if (role === 'customer') {
    return {
      inline_keyboard: [
        [
          { text: '✅ Connect', callback_data: `reno_connect:${matchId}` },
          { text: '❌ Skip', callback_data: `reno_skip:${matchId}` },
        ],
      ],
    };
  } else if (role === 'renovator') {
    return {
      inline_keyboard: [
        [
          { text: '✅ Accept', callback_data: `reno_accept:${matchId}` },
          { text: '❌ Decline', callback_data: `reno_decline:${matchId}` },
        ],
      ],
    };
  }

  return null;
}

function getStarRating(rating) {
  if (!rating || rating === 0) return '⭐ New';
  
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  
  let stars = '⭐'.repeat(fullStars);
  if (hasHalf && fullStars < 5) stars += '✨';
  
  return stars;
}

function formatDate(dateString) {
  if (!dateString) return 'ASAP';
  
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else if (date < today) {
    return 'ASAP';
  } else {
    return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  }
}
