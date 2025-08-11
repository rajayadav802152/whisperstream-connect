-- Create needed enum types
create type public.member_role as enum ('admin', 'member');
create type public.attachment_type as enum ('image', 'video', 'document');
create type public.message_type as enum ('text', 'image', 'video', 'document');

-- Profiles table for display names and avatars
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Basic profiles policies
create policy if not exists "Profiles viewable by authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy if not exists "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy if not exists "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Update trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger on profiles
create or replace trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Groups table
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.groups enable row level security;

-- Group members
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (group_id, user_id)
);

alter table public.group_members enable row level security;

-- Helper function to check admin role
create or replace function public.is_group_admin(_user uuid, _group uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members gm
    where gm.group_id = _group and gm.user_id = _user and gm.role = 'admin'
  );
$$;

-- RLS on groups: members can select, admins can update, creator can insert
create policy if not exists "Members can view groups"
  on public.groups for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = id and gm.user_id = auth.uid()
    )
  );

create policy if not exists "Authenticated can create groups"
  on public.groups for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy if not exists "Admins can update groups"
  on public.groups for update
  to authenticated
  using (public.is_group_admin(auth.uid(), id));

-- Trigger to set updated_at on groups
create or replace trigger trg_groups_updated_at
before update on public.groups
for each row execute function public.update_updated_at_column();

-- After insert trigger to add creator as admin member
create or replace function public.add_creator_as_admin()
returns trigger as $$
begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace trigger trg_groups_creator_admin
after insert on public.groups
for each row execute function public.add_creator_as_admin();

-- RLS for group_members
create policy if not exists "Members can view group_members"
  on public.group_members for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members gm2
      where gm2.group_id = group_id and gm2.user_id = auth.uid()
    )
  );

create policy if not exists "Admins can add members"
  on public.group_members for insert
  to authenticated
  with check (public.is_group_admin(auth.uid(), group_id));

create policy if not exists "Admins can remove members"
  on public.group_members for delete
  to authenticated
  using (public.is_group_admin(auth.uid(), group_id));

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text,
  type public.message_type not null default 'text',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- RLS: members can view messages, members can insert their own
create policy if not exists "Members can view messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_id and gm.user_id = auth.uid()
    )
  );

create policy if not exists "Members can send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_id and gm.user_id = auth.uid()
    )
  );

-- Trigger for messages updated_at
create or replace trigger trg_messages_updated_at
before update on public.messages
for each row execute function public.update_updated_at_column();

-- Message attachments
create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  type public.attachment_type not null,
  url text not null,
  mime_type text,
  size_bytes integer,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

alter table public.message_attachments enable row level security;

-- RLS: members of the message's group can view; sender can insert
create policy if not exists "Members can view attachments"
  on public.message_attachments for select
  to authenticated
  using (
    exists (
      select 1 from public.messages m
      join public.group_members gm on gm.group_id = m.group_id
      where m.id = message_id and gm.user_id = auth.uid()
    )
  );

create policy if not exists "Senders can add attachments"
  on public.message_attachments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.messages m
      where m.id = message_id and m.sender_id = auth.uid()
    )
  );

-- Enable realtime on key tables
alter table public.messages replica identity full;
alter table public.groups replica identity full;
alter table public.group_members replica identity full;

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.groups;
alter publication supabase_realtime add table public.group_members;

-- Storage buckets
insert into storage.buckets (id, name, public)
values ('group-avatars', 'group-avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

-- Storage policies for group-avatars
create policy if not exists "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'group-avatars');

create policy if not exists "Admins can manage avatars"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'group-avatars' and
    exists (
      select 1 from public.groups g
      where g.id::text = (storage.foldername(name))[1] and public.is_group_admin(auth.uid(), g.id)
    )
  )
  with check (
    bucket_id = 'group-avatars' and
    exists (
      select 1 from public.groups g
      where g.id::text = (storage.foldername(name))[1] and public.is_group_admin(auth.uid(), g.id)
    )
  );

-- Storage policies for attachments
create policy if not exists "Members can read attachments"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'attachments' and
    exists (
      select 1 from public.group_members gm
      where gm.group_id::text = (storage.foldername(name))[1] and gm.user_id = auth.uid()
    )
  );

create policy if not exists "Members can upload attachments"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'attachments' and
    exists (
      select 1 from public.group_members gm
      where gm.group_id::text = (storage.foldername(name))[1] and gm.user_id = auth.uid()
    )
  );

create policy if not exists "Admins can delete attachments"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'attachments' and
    exists (
      select 1 from public.group_members gm
      where gm.group_id::text = (storage.foldername(name))[1] and gm.user_id = auth.uid() and gm.role = 'admin'
    )
  );