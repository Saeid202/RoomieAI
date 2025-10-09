import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface MessageButtonProps {
  propertyId: string;
  landlordId: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function MessageButton({ 
  propertyId, 
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
      console.log('MessageButton clicked!', { propertyId, landlordId });
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to send messages');
        navigate('/auth');
        return;
      }

      if (user.id === landlordId) {
        toast.error('You cannot message yourself');
        return;
      }

      console.log('Creating conversation...');
      
      // Check if conversation already exists
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations' as any)
        .select('id')
        .eq('property_id', propertyId)
        .eq('landlord_id', landlordId)
        .eq('tenant_id', user.id)
        .single();

      let conversationId;

      if (existingConversation && !fetchError) {
        conversationId = (existingConversation as any).id;
        console.log('Found existing conversation:', conversationId);
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations' as any)
          .insert({
            property_id: propertyId,
            landlord_id: landlordId,
            tenant_id: user.id
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          toast.error('Failed to create conversation: ' + createError.message);
          return;
        }
        
        conversationId = (newConversation as any).id;
        console.log('Created new conversation:', conversationId);
      }

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