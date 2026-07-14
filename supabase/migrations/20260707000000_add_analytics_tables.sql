-- Analytics Tables for Real-Time Visitor & Download Tracking

-- Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
  session_id TEXT PRIMARY KEY,
  ip TEXT,
  country TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  user_agent TEXT,
  first_visit TIMESTAMPTZ NOT NULL,
  last_active TIMESTAMPTZ NOT NULL,
  notified_left BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON public.sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_last_active_idx ON public.sessions(last_active DESC);

-- Visits Table (already created in first migration, recreating for completeness)
CREATE TABLE IF NOT EXISTS public.visits_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES public.sessions(session_id) ON DELETE CASCADE,
  ip TEXT,
  country TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  path TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visits_analytics_created_at_idx ON public.visits_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS visits_analytics_session_idx ON public.visits_analytics(session_id);

-- Downloads Table (extended with session tracking)
CREATE TABLE IF NOT EXISTS public.downloads_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES public.sessions(session_id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  ip TEXT,
  country TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  user_agent TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  extracted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS downloads_analytics_created_at_idx ON public.downloads_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS downloads_analytics_started_at_idx ON public.downloads_analytics(started_at DESC);
CREATE INDEX IF NOT EXISTS downloads_analytics_session_idx ON public.downloads_analytics(session_id);

-- Extractions Table (track when users extract files)
CREATE TABLE IF NOT EXISTS public.extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES public.sessions(session_id) ON DELETE SET NULL,
  download_id UUID REFERENCES public.downloads_analytics(id) ON DELETE SET NULL,
  ip TEXT,
  country TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS extractions_created_at_idx ON public.extractions(created_at DESC);
CREATE INDEX IF NOT EXISTS extractions_session_idx ON public.extractions(session_id);

-- Notifications Table (real-time events)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  payload JSONB,
  delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_delivered_idx ON public.notifications(delivered);

-- Enable RLS and grant access
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Grant service_role full access (for admin operations)
GRANT ALL ON public.sessions TO service_role;
GRANT ALL ON public.visits_analytics TO service_role;
GRANT ALL ON public.downloads_analytics TO service_role;
GRANT ALL ON public.extractions TO service_role;
GRANT ALL ON public.notifications TO service_role;

-- RLS Policies (service_role bypasses anyway, but good practice)
CREATE POLICY "service_role full access" ON public.sessions TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role full access" ON public.visits_analytics TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role full access" ON public.downloads_analytics TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role full access" ON public.extractions TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role full access" ON public.notifications TO service_role USING (TRUE) WITH CHECK (TRUE);
