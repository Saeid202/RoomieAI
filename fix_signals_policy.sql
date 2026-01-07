-- Add missing UPDATE policy for co-ownership signals
create policy "Users can update their own signals"
on public.co_ownership_signals
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
