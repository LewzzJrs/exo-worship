-- Exo Worship Library: tabel lagu, setlist tim, pengaturan, trending, suka, dan request.
-- Jalankan di Supabase: SQL Editor -> New query -> tempel semua isi file ini -> Run.
-- Aman dijalankan ulang, data yang sudah ada tidak terhapus.

-- Lagu, dikelola admin. slug dipakai di link dan tidak berubah walau judul diganti
create table if not exists public.songs (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 120),
  artist text not null default '' check (char_length(artist) <= 120),
  key text not null check (char_length(key) <= 4),
  bpm int check (bpm between 20 and 300),
  time_signature text check (char_length(time_signature) <= 10),
  youtube_url text check (char_length(youtube_url) <= 300),
  content text not null default '' check (char_length(content) <= 30000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Setlist tim, dibuat admin. items berisi daftar { slug, key } sesuai urutan
create table if not exists public.team_setlists (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  date date not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pengaturan aplikasi, misalnya kode akses tim (disimpan dalam bentuk hash)
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Lagu dibuka: satu HP dihitung sekali per hari per lagu
create table if not exists public.song_views (
  id bigint generated always as identity primary key,
  song_slug text not null,
  device_id uuid not null,
  viewed_on date not null default (now() at time zone 'Asia/Jakarta')::date,
  created_at timestamptz not null default now(),
  unique (song_slug, device_id, viewed_on)
);
create index if not exists song_views_viewed_on_idx on public.song_views (viewed_on);

-- Suka: satu HP hanya bisa memberi satu suka per lagu
create table if not exists public.song_likes (
  song_slug text not null,
  device_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (song_slug, device_id)
);

-- Request lagu dari anggota
create table if not exists public.song_requests (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null,
  requester_name text not null check (char_length(requester_name) between 1 and 60),
  title text not null check (char_length(title) between 1 and 120),
  artist text check (char_length(artist) <= 120),
  youtube_url text check (char_length(youtube_url) <= 300),
  note text check (char_length(note) <= 500),
  status text not null default 'menunggu'
    check (status in ('menunggu', 'diproses', 'selesai', 'ditolak')),
  song_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists song_requests_device_idx
  on public.song_requests (device_id, created_at desc);

-- Trending: anggota yang membuka lagu + suka (dihitung 2x) dalam beberapa hari terakhir
create or replace function public.trending_songs(days int default 7, max_results int default 5)
returns table (song_slug text, score bigint)
language sql
stable
set search_path = ''
as $$
  with since as (
    select (now() at time zone 'Asia/Jakarta')::date - days as day
  ),
  views as (
    select v.song_slug, count(distinct v.device_id) as total
    from public.song_views v, since
    where v.viewed_on > since.day
    group by v.song_slug
  ),
  likes as (
    select l.song_slug, count(*) as total
    from public.song_likes l, since
    where l.created_at > since.day
    group by l.song_slug
  )
  select
    coalesce(v.song_slug, l.song_slug) as song_slug,
    coalesce(v.total, 0) + 2 * coalesce(l.total, 0) as score
  from views v
  full outer join likes l on l.song_slug = v.song_slug
  order by score desc
  limit max_results;
$$;

-- Cari lagu dari judul, artis, atau potongan lirik
create or replace function public.search_songs(keyword text)
returns setof public.songs
language sql
stable
set search_path = ''
as $$
  select *
  from public.songs s
  where s.title ilike '%' || keyword || '%'
    or s.artist ilike '%' || keyword || '%'
    or s.content ilike '%' || keyword || '%';
$$;

-- Keamanan: semua tabel hanya bisa diakses dari server aplikasi (secret key).
-- RLS aktif tanpa policy, dan akses publik dicabut, jadi browser tidak bisa membaca langsung.
alter table public.songs enable row level security;
alter table public.team_setlists enable row level security;
alter table public.app_settings enable row level security;
alter table public.song_views enable row level security;
alter table public.song_likes enable row level security;
alter table public.song_requests enable row level security;

revoke all on public.songs, public.team_setlists, public.app_settings,
  public.song_views, public.song_likes, public.song_requests from anon, authenticated;
revoke execute on function public.trending_songs(int, int) from public, anon, authenticated;
revoke execute on function public.search_songs(text) from public, anon, authenticated;

grant select, insert, update, delete on public.songs, public.team_setlists, public.app_settings,
  public.song_views, public.song_likes, public.song_requests to service_role;
grant usage on all sequences in schema public to service_role;
grant execute on function public.trending_songs(int, int) to service_role;
grant execute on function public.search_songs(text) to service_role;
