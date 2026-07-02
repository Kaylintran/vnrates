-- Migration 003: Switch USDT P2P ratio benchmark from VCB USD to VCB AUD.

ALTER TABLE public.usdt_p2p_snapshots
  RENAME COLUMN vcb_usd_rate TO vcb_aud_rate;
