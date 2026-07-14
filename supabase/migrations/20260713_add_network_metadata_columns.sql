ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS ip_country TEXT,
  ADD COLUMN IF NOT EXISTS ip_city TEXT,
  ADD COLUMN IF NOT EXISTS asn TEXT,
  ADD COLUMN IF NOT EXISTS isp TEXT;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS ip_country TEXT,
  ADD COLUMN IF NOT EXISTS ip_city TEXT,
  ADD COLUMN IF NOT EXISTS asn TEXT,
  ADD COLUMN IF NOT EXISTS isp TEXT;

ALTER TABLE public.downloads
  ADD COLUMN IF NOT EXISTS ip_country TEXT,
  ADD COLUMN IF NOT EXISTS ip_city TEXT,
  ADD COLUMN IF NOT EXISTS asn TEXT,
  ADD COLUMN IF NOT EXISTS isp TEXT;

CREATE INDEX IF NOT EXISTS visits_network_idx
  ON public.visits(ip_country, ip_city, asn, created_at DESC);

CREATE INDEX IF NOT EXISTS sessions_network_idx
  ON public.sessions(ip_country, ip_city, asn, last_active DESC);
