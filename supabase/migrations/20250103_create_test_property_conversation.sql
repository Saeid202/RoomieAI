-- Create test property conversation to demonstrate the messaging system
-- This migration creates a sample property and conversation for testing

-- First, let's create a test property (Rose 2) if it doesn't exist
INSERT INTO public.properties (
  id,
  user_id,
  property_type,
  listing_title,
  description,
  address,
  city,
  state,
  zip_code,
  monthly_rent,
  bedrooms,
  bathrooms,
  amenities,
  created_at,
  updated_at
) VALUES (
  'rose-2-property-id-12345',
  auth.uid(), -- This will use the current authenticated user as landlord
  'Apartment',
  'Rose 2 - Beautiful Downtown Apartment',
  'A stunning 2-bedroom apartment in the heart of downtown. Features modern amenities, hardwood floors, and a private balcony with city views.',
  '123 Rose Street',
  'Downtown',
  'CA',
  '90210',
  2500.00,
  2,
  2.0,
  ARRAY['WiFi', 'Parking', 'Laundry', 'Balcony', 'Hardwood Floors'],
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Create a test conversation for this property
-- Note: This will only work if there are existing users in the system
-- The conversation will be created when a tenant actually messages about this property

-- Create a test profile for demonstration (if needed)
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  created_at,
  updated_at
) VALUES (
  'test-tenant-id-67890',
  'Test Tenant',
  'test.tenant@example.com',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Create a test property conversation
INSERT INTO public.conversations (
  id,
  type,
  context_type,
  context_id,
  title,
  created_by,
  last_message_at,
  created_at,
  updated_at
) VALUES (
  'test-conversation-id-11111',
  'property',
  'property',
  'rose-2-property-id-12345',
  'Rose 2 - Beautiful Downtown Apartment - Test Tenant',
  'test-tenant-id-67890',
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Add participants to the conversation
INSERT INTO public.conversation_participants (
  id,
  conversation_id,
  user_id,
  role,
  joined_at,
  last_read_at,
  is_muted,
  is_archived
) VALUES 
(
  'participant-tenant-11111',
  'test-conversation-id-11111',
  'test-tenant-id-67890',
  'tenant',
  now(),
  null,
  false,
  false
),
(
  'participant-landlord-11111',
  'test-conversation-id-11111',
  auth.uid(),
  'landlord',
  now(),
  null,
  false,
  false
) ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Add a test message
INSERT INTO public.messages (
  id,
  conversation_id,
  sender_id,
  content,
  message_type,
  metadata,
  created_at
) VALUES (
  'test-message-id-11111',
  'test-conversation-id-11111',
  'test-tenant-id-67890',
  'Hi! I''m interested in the Rose 2 apartment. Is it still available? I''d love to schedule a viewing.',
  'text',
  '{}',
  now()
) ON CONFLICT (id) DO NOTHING;

-- Update the conversation's last_message_at
UPDATE public.conversations 
SET last_message_at = now()
WHERE id = 'test-conversation-id-11111';
