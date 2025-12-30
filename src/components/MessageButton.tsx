import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MessagingService } from '@/services/messagingService';

interface MessageButtonProps {
  propertyId?: string;
  salesListingId?: string;
  landlordId: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function MessageButton({
  propertyId,
  salesListingId,
  landlordId,
  className,
  variant = 'outline',
  size = 'default',
  children
}: MessageButtonProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleMessageClick = async () => {
    try {
      setLoading(true);
      console.log('MessageButton clicked!', { propertyId, salesListingId, landlordId });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to send messages');
        navigate('/auth');
        return;
      }

      if (user.id === landlordId) {
        // If messaging yourself, just go to chats
        toast.info('Opening your conversations...');
        navigate('/dashboard/chats');
        return;
      }

      console.log('Creating/getting conversation...');

      let conversationId;
      const isCoOwnership = children?.toString().toLowerCase().includes('co') || children?.toString().toLowerCase().includes('join');

      if (isCoOwnership && salesListingId) {
        console.log('Using group join logic for co-ownership...');
        conversationId = await MessagingService.joinCoOwnershipGroup(
          salesListingId,
          user.id,
          landlordId
        );
      } else {
        conversationId = await MessagingService.getOrCreateConversation(
          propertyId || null,
          landlordId,
          user.id,
          salesListingId || null
        );
      }

      console.log('Conversation found/created:', conversationId);

      toast.success('Opening conversation...');

      // Navigate to chats page with conversation ID
      navigate(`/dashboard/chats?conversation=${conversationId}`);

    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error(`Failed to start conversation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleMessageClick}
      disabled={loading}
      className={className}
      variant={variant}
      size={size}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {loading ? 'Starting...' : (children || 'Message')}
    </Button>
  );
}