-- =========================================================
-- CheckMate Priority Notification System
-- Jalankan semua query ini di Supabase Dashboard > SQL Editor
-- =========================================================

create extension if not exists "pgcrypto";

-- -------------------------
-- 1) Profiles
-- -------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text unique not null,
  avatar_data_url text,
  gui_scale integer not null default 1 check (gui_scale between 1 and 3),
  dark_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------
-- 2) Items: task dan activity disatukan agar analitik lebih mudah
-- -------------------------
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('task', 'activity')),
  title text not null,
  note text,
  status text not null default 'remaining' check (status in ('remaining', 'completed')),
  deadline_date date not null,
  completed_at timestamptz,
  task_type text check (task_type in ('Individu', 'Kelompok', 'Ujian')),
  impact text check (impact in ('Besar', 'Sedang', 'Kecil')),
  late_consequence text check (late_consequence in ('Tinggi', 'Sedang', 'Rendah')),
  difficulty text check (difficulty in ('Sulit', 'Sedang', 'Mudah')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint task_fields_required check (
    (type = 'activity') or
    (type = 'task' and task_type is not null and impact is not null and late_consequence is not null and difficulty is not null)
  )
);

-- -------------------------
-- 3) Notifications
-- tag dipakai untuk mencegah spam notifikasi otomatis yang sama berulang-ulang.
-- -------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,
  title text not null,
  message text not null,
  level text not null default 'info' check (level in ('info', 'success', 'warning', 'danger')),
  tag text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, tag)
);

-- -------------------------
-- updated_at trigger
-- -------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_items_updated_at on public.items;
create trigger set_items_updated_at
before update on public.items
for each row execute function public.set_updated_at();

-- -------------------------
-- Otomatis membuat profile saat user signup
-- -------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  wanted_username text;
begin
  wanted_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));

  insert into public.profiles (id, username, email)
  values (new.id, wanted_username, new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- -------------------------
-- Helper login username/email
-- Catatan: ini untuk project kelas agar login username mudah.
-- Untuk production besar, biasanya feedback login dibuat lebih generic.
-- -------------------------
create or replace function public.resolve_login_email(identifier text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select email
  from public.profiles
  where lower(email) = lower(identifier)
     or lower(username) = lower(identifier)
  limit 1;
$$;

grant execute on function public.resolve_login_email(text) to anon, authenticated;

create or replace function public.is_username_available(p_username text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(p_username)
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;

-- -------------------------
-- RLS
-- -------------------------
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.notifications enable row level security;

-- Profiles: user hanya bisa lihat/update profile sendiri.
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Items
drop policy if exists "Users can view own items" on public.items;
create policy "Users can view own items"
on public.items for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own items" on public.items;
create policy "Users can insert own items"
on public.items for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own items" on public.items;
create policy "Users can update own items"
on public.items for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own items" on public.items;
create policy "Users can delete own items"
on public.items for delete
to authenticated
using (auth.uid() = user_id);

-- Notifications
drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
on public.notifications for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own notifications" on public.notifications;
create policy "Users can insert own notifications"
on public.notifications for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
on public.notifications for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
on public.notifications for delete
to authenticated
using (auth.uid() = user_id);

-- Index agar query lebih cepat
-- Kolom ini aman dijalankan ulang. Dipakai untuk menyimpan tanggal/waktu saat user klik tombol Selesai.
alter table public.items add column if not exists completed_at timestamptz;

create index if not exists idx_items_user_status on public.items(user_id, status);
create index if not exists idx_items_completed_at on public.items(user_id, completed_at desc);
create index if not exists idx_items_deadline on public.items(deadline_date);
create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);
