export interface Conversation {
  id: string;
  property_id: string;
  emergency_job_id?: string;
  landlord_id: string;
  tenant_id: string;
  created_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages?: Message[];
  property_title?: string;
  landlord_name?: string;
  tenant_name?: string;
  emergency_job?: {
    category: string;
    unit_address: string;
    status: string;
  };
}
