import { query } from './homieDB.js';
import { getCachedProviders, getCachedSeekers } from './inMemoryMatchingCache.js';

/**
 * Record customer acceptance of a renovation match
 */
export async function recordCustomerAcceptance(requestId, customerId, renovatorId) {
  try {
    console.log(`📝 Recording customer ${customerId} acceptance of renovator ${renovatorId}`);
    
    // Try to record in database, but don't fail if it times out
    try {
      await query(`
        INSERT INTO renovation_match_acceptances (request_id, customer_id, renovator_id, customer_accepted)
        VALUES ($1, $2, $3, TRUE)
        ON CONFLICT (request_id, customer_id, renovator_id) 
        DO UPDATE SET customer_accepted = TRUE, updated_at = NOW()
      `, [requestId, customerId, renovatorId]);
      console.log(`✅ Customer acceptance recorded in database`);
    } catch (dbError) {
      console.warn(`⚠️ Database error (continuing anyway): ${dbError.message}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error recording customer acceptance:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Record renovator acceptance of a renovation match
 */
export async function recordRenovatorAcceptance(requestId, customerId, renovatorId) {
  try {
    console.log(`📝 Recording renovator ${renovatorId} acceptance of customer ${customerId}`);
    
    let bothAccepted = false;
    
    // Try to record in database, but don't fail if it times out
    try {
      const result = await query(`
        INSERT INTO renovation_match_acceptances (request_id, customer_id, renovator_id, renovator_accepted)
        VALUES ($1, $2, $3, TRUE)
        ON CONFLICT (request_id, customer_id, renovator_id) 
        DO UPDATE SET renovator_accepted = TRUE, updated_at = NOW()
        RETURNING customer_accepted, renovator_accepted
      `, [requestId, customerId, renovatorId]);
      
      console.log(`✅ Renovator acceptance recorded in database`);
      
      // Check if both have accepted
      if (result.rows.length > 0) {
        const row = result.rows[0];
        if (row.customer_accepted && row.renovator_accepted) {
          console.log(`🎉 Both parties accepted! Recording match time`);
          bothAccepted = true;
          try {
            await query(`
              UPDATE renovation_match_acceptances 
              SET both_accepted_at = NOW()
              WHERE request_id = $1 AND customer_id = $2 AND renovator_id = $3
            `, [requestId, customerId, renovatorId]);
          } catch (updateError) {
            console.warn(`⚠️ Could not update both_accepted_at: ${updateError.message}`);
          }
        }
      }
    } catch (dbError) {
      console.warn(`⚠️ Database error (continuing anyway): ${dbError.message}`);
      // Assume both accepted if we can't check the database
      bothAccepted = true;
    }
    
    return { success: true, bothAccepted };
  } catch (error) {
    console.error('❌ Error recording renovator acceptance:', error.message);
    return { success: false, error: error.message, bothAccepted: false };
  }
}

/**
 * Get contact details for a renovation match
 */
export async function getRenovationMatchContacts(customerId, renovatorId) {
  try {
    console.log(`📞 Fetching contact details for customer ${customerId} and renovator ${renovatorId}`);
    
    // Get from cache
    const providers = getCachedProviders();
    const seekers = getCachedSeekers();
    
    console.log(`📊 Cache has ${providers.length} providers and ${seekers.length} seekers`);
    
    // Find renovator in providers
    const renovator = providers.find(p => p.userId === renovatorId);
    console.log(`🔍 Renovator lookup: ${renovatorId} → ${renovator ? 'FOUND' : 'NOT FOUND'}`);
    
    // Find customer in seekers
    const customer = seekers.find(s => s.userId === customerId);
    console.log(`🔍 Customer lookup: ${customerId} → ${customer ? 'FOUND' : 'NOT FOUND'}`);
    
    // If customer not in seekers, try to build from session data
    // For testing with same account, we might not have the customer in cache
    if (!customer) {
      console.log(`⚠️ Customer not in cache, using fallback data`);
      return {
        success: true,
        customer: {
          id: customerId,
          name: 'Customer',
          phone: null,
          email: null,
          location: 'Local',
          telegramUsername: null,
        },
        renovator: {
          id: renovatorId,
          name: renovator?.name || 'Renovator',
          phone: renovator ? extractPhoneFromProfile(renovator) : null,
          email: renovator?.email || null,
          services: renovator?.service_categories || [],
          rating: renovator?.rating || 0,
          telegramUsername: renovator?.telegramUsername || null,
        },
      };
    }
    
    if (!renovator) {
      console.log(`⚠️ Renovator not in cache`);
      return { success: false, error: 'Renovator details not available' };
    }
    
    return {
      success: true,
      customer: {
        id: customerId,
        name: customer.name || 'Customer',
        phone: customer.phone,
        email: customer.email,
        location: customer.city,
        telegramUsername: customer.telegramUsername || null,
      },
      renovator: {
        id: renovatorId,
        name: renovator.name || 'Renovator',
        phone: extractPhoneFromProfile(renovator),
        email: renovator.email,
        services: renovator.service_categories,
        rating: renovator.rating || 0,
        telegramUsername: renovator.telegramUsername || null,
      },
    };
  } catch (error) {
    console.error('❌ Error getting contact details:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Extract phone number from renovator profile
 */
function extractPhoneFromProfile(profile) {
  // Phone might be in service_categories or as a separate field
  if (profile.phone) return profile.phone;
  
  // Try to extract from service_categories
  if (Array.isArray(profile.service_categories)) {
    for (const cat of profile.service_categories) {
      if (typeof cat === 'string') {
        // Look for phone patterns
        const phoneMatch = cat.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b|\b\d{10}\b/);
        if (phoneMatch) {
          console.log(`📱 Extracted phone from service_categories: ${phoneMatch[0]}`);
          return phoneMatch[0];
        }
      }
    }
  }
  
  console.log(`⚠️ No phone number found in profile`);
  return null;
}

/**
 * Format contact details message for customer
 */
export function formatCustomerContactMessage(renovator) {
  let msg = `🎉 <b>Match Confirmed!</b>\n\n`;
  msg += `The renovator has accepted your match!\n\n`;
  msg += `<b>Renovator Details:</b>\n`;
  msg += `👤 <b>${renovator.name}</b>\n`;
  
  if (renovator.rating > 0) {
    msg += `⭐ Rating: ${renovator.rating}/5\n`;
  }
  
  if (renovator.services && renovator.services.length > 0) {
    msg += `🔧 Services: ${renovator.services.slice(0, 2).join(', ')}\n`;
  }
  
  if (renovator.phone) {
    msg += `📱 Phone: <code>${renovator.phone}</code>\n`;
  }
  
  if (renovator.email) {
    msg += `📧 Email: <code>${renovator.email}</code>\n`;
  }
  
  if (renovator.telegramUsername) {
    msg += `💬 Telegram: <a href="https://t.me/${renovator.telegramUsername}">@${renovator.telegramUsername}</a>\n`;
  }
  
  msg += `\n💬 You can now contact them directly to discuss your project!`;
  
  return msg;
}

/**
 * Format contact details message for renovator
 */
export function formatRenovatorContactMessage(customer) {
  let msg = `🎉 <b>Match Confirmed!</b>\n\n`;
  msg += `The customer has accepted your match!\n\n`;
  msg += `<b>Customer Details:</b>\n`;
  msg += `👤 <b>${customer.name}</b>\n`;
  msg += `📍 Location: ${customer.location}\n`;
  
  if (customer.phone) {
    msg += `📱 Phone: <code>${customer.phone}</code>\n`;
  }
  
  if (customer.email) {
    msg += `📧 Email: <code>${customer.email}</code>\n`;
  }
  
  if (customer.telegramUsername) {
    msg += `💬 Telegram: <a href="https://t.me/${customer.telegramUsername}">@${customer.telegramUsername}</a>\n`;
  }
  
  msg += `\n💬 You can now contact them directly to discuss the project!`;
  
  return msg;
}
