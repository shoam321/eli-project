-- Add image_url column to devices table
alter table public.devices add column if not exists image_url text;
