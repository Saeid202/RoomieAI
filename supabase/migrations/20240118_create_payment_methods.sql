create table if not exists public.payment_methods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  stripe_payment_method_id text not null,
  card_type text check (card_type in ('credit', 'debit')),
  brand text,
  last4 text,
  exp_month integer,
  exp_year integer,
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table public.payment_methods enable row level security;

create policy "Users can view their own payment methods"
on public.payment_methods for select
using (auth.uid() = user_id);

create policy "Users can insert their own payment methods"
on public.payment_methods for insert
with check (auth.uid() = user_id);

create policy "Users can update their own payment methods"
on public.payment_methods for update
using (auth.uid() = user_id);

create policy "Users can delete their own payment methods"
on public.payment_methods for delete
using (auth.uid() = user_id);
