-- Create Co-Ownership Groups and Members tables
-- This supports group chats for co-ownership properties

-- 1. Create the Groups table
CREATE TABLE IF NOT EXISTS public.co_ownership_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sales_listing_id UUID NOT NULL REFERENCES public.sales_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(sales_listing_id) -- Usually one main group per property
);

-- 2. Create the Members table
CREATE TABLE IF NOT EXISTS public.co_ownership_group_members (
    group_id UUID NOT NULL REFERENCES public.co_ownership_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (group_id, user_id)
);

-- 3. Update conversations table to support group_id
-- This allows messages to be associated with a co-ownership group
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS co_ownership_group_id UUID REFERENCES public.co_ownership_groups(id) ON DELETE CASCADE;

-- 4. Enable RLS
ALTER TABLE public.co_ownership_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co_ownership_group_members ENABLE ROW LEVEL SECURITY;

-- 5. Policies for co_ownership_groups
DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON public.co_ownership_groups;
CREATE POLICY "Public groups are viewable by everyone" 
ON public.co_ownership_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create a group for a listing" ON public.co_ownership_groups;
CREATE POLICY "Anyone can create a group for a listing" 
ON public.co_ownership_groups FOR INSERT WITH CHECK (true);

-- 6. Policies for co_ownership_group_members
DROP POLICY IF EXISTS "Members are viewable by everyone" ON public.co_ownership_group_members;
CREATE POLICY "Members are viewable by everyone" 
ON public.co_ownership_group_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join a group" ON public.co_ownership_group_members;
CREATE POLICY "Users can join a group" 
ON public.co_ownership_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave a group" ON public.co_ownership_group_members;
CREATE POLICY "Users can leave a group" 
ON public.co_ownership_group_members FOR DELETE USING (auth.uid() = user_id);

-- 7. Update conversation and message policies for groups
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT
  USING (
    auth.uid() = landlord_id 
    OR auth.uid() = tenant_id 
    OR EXISTS (
      SELECT 1 FROM public.co_ownership_group_members 
      WHERE group_id = conversations.co_ownership_group_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
        AND (
          conversations.landlord_id = auth.uid() 
          OR conversations.tenant_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.co_ownership_group_members 
            WHERE group_id = conversations.co_ownership_group_id AND user_id = auth.uid()
          )
        )
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
CREATE POLICY "Users can send messages in their conversations" ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
        AND (
          conversations.landlord_id = auth.uid() 
          OR conversations.tenant_id = auth.uid()
          -- Verify the sender is a member of the linked co-ownership group if it exists
          OR EXISTS (
            SELECT 1 FROM public.co_ownership_group_members 
            WHERE group_id = conversations.co_ownership_group_id AND user_id = auth.uid()
          )
        )
    )
  );
