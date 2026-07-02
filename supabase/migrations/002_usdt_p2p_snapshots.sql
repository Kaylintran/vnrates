-- Migration 002: USDT P2P (Binance) rate snapshots, collected twice daily via cron.
-- Ratio (vs. VCB USD) and variance % are derived at read time, not stored here.

CREATE TABLE IF NOT EXISTS public.usdt_p2p_snapshots (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  collected_at timestamptz NOT NULL DEFAULT now(),
  buy_low numeric,
  buy_moderate numeric,
  buy_high numeric,
  buy_avg numeric,
  sell_low numeric,
  sell_moderate numeric,
  sell_high numeric,
  sell_avg numeric,
  vcb_usd_rate numeric,
  source text NOT NULL DEFAULT 'binance_p2p'
);

ALTER TABLE public.usdt_p2p_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read" ON public.usdt_p2p_snapshots
  FOR SELECT USING (true);
