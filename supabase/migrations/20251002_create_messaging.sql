-- Messaging schema for conversations, participants, messages, attachments, and matches
-- Safe to run multiple times in dev; in prod ensure idempotency via IF NOT EXISTS

-- Enable required extensions
create extension if not exists pgcrypto;

-- Conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct','application','group')),
  context_type text,
  context_id uuid,
  title text,
  created_by uuid not null references auth.users(id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Participants
create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  is_muted boolean default false,
  is_archived boolean default false,
  unique (conversation_id, user_id)
);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text,
  message_type text not null default 'text' check (message_type in ('text','image','file','system')),
  metadata jsonb not null default '{}'::jsonb,
  reply_to_id uuid null references public.messages(id) on delete set null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

-- Attachments
create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  storage_path text not null,
  mime_type text,
  size int,
  width int,
  height int,
  thumbnail_path text,
  created_at timestamptz not null default now()
);

-- Optional match gate for tenant-to-tenant chat
create table if not exists public.roommate_matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending','matched','blocked')),
  created_at timestamptz not null default now(),
  constraint roommate_matches_unique_pair unique (least(user_a, user_b), greatest(user_a, user_b))
);

-- Indexes
create index if not exists idx_conversations_last_message_at on public.conversations (last_message_at desc nulls last);
create index if not exists idx_participants_user on public.conversation_participants (user_id);
create index if not exists idx_messages_conv_created_at on public.messages (conversation_id, created_at desc);

-- Triggers to maintain timestamps
create or replace function public.update_conversation_last_message()
returns trigger language plpgsql as $$
begin
  update public.conversations
    set last_message_at = new.created_at,
        updated_at = now()
  where id = new.conversation_id;
  return new;
end$$;

drop trigger if exists messages_after_insert on public.messages;
create trigger messages_after_insert
after insert on public.messages
for each row execute function public.update_conversation_last_message();

-- Helper function to check membership
create or replace function public.is_conversation_participant(p_user_id uuid, p_conversation_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id and cp.user_id = p_user_id
  );
$$;

-- RLS policies
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;

-- Conversations: select if participant; insert only by creator; update only by creator
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'conversations' and policyname = 'conversations_select_if_participant'
  ) then
    create policy conversations_select_if_participant on public.conversations
      for select using (
        public.is_conversation_participant(auth.uid(), id)
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'conversations' and policyname = 'conversations_insert_by_creator'
  ) then
    create policy conversations_insert_by_creator on public.conversations
      for insert with check (created_by = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'conversations' and policyname = 'conversations_update_by_creator'
  ) then
    create policy conversations_update_by_creator on public.conversations
      for update using (created_by = auth.uid()) with check (created_by = auth.uid());
  end if;
end $$;

-- Participants: select if self or same conversation; insert/update only for self
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'conversation_participants' and policyname = 'participants_select_if_same_conv'
  ) then
    create policy participants_select_if_same_conv on public.conversation_participants
      for select using (
        public.is_conversation_participant(auth.uid(), conversation_id)
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'conversation_participants' and policyname = 'participants_insert_self'
  ) then
    create policy participants_insert_self on public.conversation_participants
      for insert with check (user_id = auth.uid());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'conversation_participants' and policyname = 'participants_update_self'
  ) then
    create policy participants_update_self on public.conversation_participants
      for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

-- Messages: select/insert only for participants; update only by sender
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'messages_select_if_participant'
  ) then
    create policy messages_select_if_participant on public.messages
      for select using (
        public.is_conversation_participant(auth.uid(), conversation_id)
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'messages_insert_if_participant'
  ) then
    create policy messages_insert_if_participant on public.messages
      for insert with check (
        public.is_conversation_participant(auth.uid(), conversation_id) and sender_id = auth.uid()
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'messages_update_by_sender'
  ) then
    create policy messages_update_by_sender on public.messages
      for update using (sender_id = auth.uid()) with check (sender_id = auth.uid());
  end if;
end $$;

-- RPC: get or create application conversation
create or replace function public.get_or_create_application_conversation(p_application_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_conv_id uuid;
  v_app record;
begin
  select ra.*, p.user_id as landlord_id into v_app
  from rental_applications ra
  join properties p on p.id = ra.property_id
  where ra.id = p_application_id;

  if v_app is null then
    raise exception 'Application not found';
  end if;

  if auth.uid() not in (v_app.landlord_id, v_app.applicant_id) then
    raise exception 'Not authorized';
  end if;

  select id into v_conv_id from conversations
  where context_type = 'rental_application' and context_id = p_application_id
  limit 1;

  if v_conv_id is null then
    insert into conversations (type, context_type, context_id, title, created_by)
    values ('application','rental_application', p_application_id, coalesce(v_app.full_name,'Application Conversation'), auth.uid())
    returning id into v_conv_id;

    insert into conversation_participants (conversation_id, user_id, role)
    values (v_conv_id, v_app.landlord_id, 'landlord')
    on conflict do nothing;

    insert into conversation_participants (conversation_id, user_id, role)
    values (v_conv_id, v_app.applicant_id, 'tenant')
    on conflict do nothing;
  end if;

  return v_conv_id;
end $$;

-- RPC: get or create direct conversation between two users
create or replace function public.get_or_create_direct_conversation(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_conv_id uuid;
  v_self uuid := auth.uid();
begin
  if p_other_user_id = v_self then
    raise exception 'Cannot chat with yourself';
  end if;

  -- Find existing direct conversation with both participants
  select c.id into v_conv_id
  from conversations c
  join conversation_participants a on a.conversation_id = c.id and a.user_id = v_self
  join conversation_participants b on b.conversation_id = c.id and b.user_id = p_other_user_id
  where c.type = 'direct'
  limit 1;

  if v_conv_id is null then
    insert into conversations (type, title, created_by)
    values ('direct', null, v_self)
    returning id into v_conv_id;

    insert into conversation_participants (conversation_id, user_id, role)
    values (v_conv_id, v_self, 'roommate')
    on conflict do nothing;

    insert into conversation_participants (conversation_id, user_id, role)
    values (v_conv_id, p_other_user_id, 'roommate')
    on conflict do nothing;
  end if;

  return v_conv_id;
end $$;

-- Storage bucket for message attachments (requires Storage enabled)
-- Note: This part may need to be created via Supabase Dashboard if SQL fails in CLI context.
do $$ begin
  perform 1 from storage.buckets where id = 'message_attachments';
  if not found then
    insert into storage.buckets (id, name, public) values ('message_attachments', 'message_attachments', false);
  end if;
end $$;

-- Storage policies for message_attachments bucket
create or replace function public.conversation_id_from_path(p_path text)
returns uuid language sql immutable as $$
  -- Expected path: conversations/{conversation_id}/...
  select nullif(regexp_replace(p_path, '^conversations\/([0-9a-fA-F-]+)\/.*$', '\1'), '')::uuid;
$$;

do $$ begin
  -- Allow read if participant
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'attachments_read_if_participant'
  ) then
    create policy attachments_read_if_participant on storage.objects
      for select using (
        bucket_id = 'message_attachments'
        and public.is_conversation_participant(auth.uid(), public.conversation_id_from_path(name))
      );
  end if;
  -- Allow upload if participant
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'attachments_upload_if_participant'
  ) then
    create policy attachments_upload_if_participant on storage.objects
      for insert with check (
        bucket_id = 'message_attachments'
        and public.is_conversation_participant(auth.uid(), public.conversation_id_from_path(name))
      );
  end if;
  -- Allow delete own uploads if participant
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'attachments_delete_if_participant'
  ) then
    create policy attachments_delete_if_participant on storage.objects
      for delete using (
        bucket_id = 'message_attachments'
        and public.is_conversation_participant(auth.uid(), public.conversation_id_from_path(name))
      );
  end if;
end $$;



