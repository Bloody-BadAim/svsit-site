-- Publieke storage bucket voor bedrijfslogo's bij vacatures.
-- Lezen gebeurt via publieke URL (public = true); schrijven loopt via de
-- service-role client in de API (bypasst RLS), dus geen extra policies nodig.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vacature-logos',
  'vacature-logos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;
