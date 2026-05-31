-- Publieke storage bucket voor recap-foto's van events.
-- Lezen gebeurt via publieke URL (public = true); schrijven loopt via de
-- service-role client in de API (bypasst RLS), dus geen extra policies nodig.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recaps',
  'recaps',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do nothing;
