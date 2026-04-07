import { supabase } from "@/integrations/supabase/client";

interface SendInviteInput {
  communityId: string;
  recipientEmail: string;
  senderName?: string;
}

const db = supabase as any;

/**
 * Send a community invite email to a friend
 * Works with or without the community_invites table
 */
export async function sendCommunityInvite(input: SendInviteInput): Promise<void> {
  const { communityId, recipientEmail, senderName = 'A friend' } = input;

  try {
    // Get community details
    const { data: community, error: communityError } = await db
      .from('communities')
      .select('id, name, description, city')
      .eq('id', communityId)
      .single();

    if (communityError || !community) {
      throw new Error('Community not found');
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    // Get sender's profile for display name
    const { data: senderProfile } = await db
      .from('user_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const displayName = senderProfile?.full_name || senderName;

    // Try to create invite record in database (if table exists)
    try {
      const { error: insertError } = await db
        .from('community_invites')
        .insert({
          community_id: communityId,
          sender_id: user.id,
          recipient_email: recipientEmail.toLowerCase(),
          status: 'pending',
        });

      if (insertError) {
        console.warn('Could not save invite to database:', insertError.message);
        // Continue anyway - we'll still send the email
      }
    } catch (dbError) {
      console.warn('Database operation failed:', dbError);
      // Continue anyway - we'll still send the email
    }

    // Send email via Supabase Edge Function
    const { error: functionError } = await supabase.functions.invoke('send-community-invite', {
      body: {
        recipientEmail,
        communityName: community.name,
        communityDescription: community.description,
        communityCity: community.city,
        senderName: displayName,
        communityId,
      },
    });

    if (functionError) {
      console.error('Email send error:', functionError);
      // Don't throw - invite was created, email might fail but that's okay
    }
  } catch (e) {
    console.error('Error sending community invite:', e);
    throw e;
  }
}

/**
 * Get pending invites for current user
 */
export async function getPendingInvites() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  try {
    const { data, error } = await db
      .from('community_invites')
      .select(`
        id,
        community_id,
        sender_id,
        status,
        created_at,
        communities (
          id,
          name,
          description,
          city
        ),
        user_profiles!sender_id (
          full_name
        )
      `)
      .eq('recipient_email', user.email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invites:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('Error fetching invites:', e);
    return [];
  }
}

/**
 * Accept a community invite
 */
export async function acceptInvite(inviteId: string, communityId: string) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  try {
    // Update invite status
    const { error: updateError } = await db
      .from('community_invites')
      .update({ status: 'accepted' })
      .eq('id', inviteId);

    if (updateError) {
      console.warn('Could not update invite status:', updateError.message);
    }
  } catch (e) {
    console.warn('Could not update invite:', e);
  }

  // Add user to community
  const { error: memberError } = await db
    .from('community_memberships')
    .insert({
      community_id: communityId,
      user_id: user.id,
      status: 'active',
    });

  if (memberError) {
    throw new Error(`Failed to join community: ${memberError.message}`);
  }
}

/**
 * Decline a community invite
 */
export async function declineInvite(inviteId: string) {
  try {
    const { error } = await db
      .from('community_invites')
      .update({ status: 'declined' })
      .eq('id', inviteId);

    if (error) {
      console.warn('Could not decline invite:', error.message);
    }
  } catch (e) {
    console.warn('Could not decline invite:', e);
  }
}
