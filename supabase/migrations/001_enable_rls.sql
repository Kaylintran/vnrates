-- Migration 001: Enable RLS on exchange_rates and add source tracking

-- 1. Add source column to distinguish live vs estimated data
ALTER TABLE public.exchange_rates
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'live';

-- 2. Enable Row Level Security
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to SELECT (exchange rates are public data)
--    Service role key used server-side bypasses RLS for writes automatically.
CREATE POLICY "allow_public_read" ON public.exchange_rates
  FOR SELECT USING (true);
