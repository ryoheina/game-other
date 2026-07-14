ALTER TABLE public.downloads
  ADD COLUMN IF NOT EXISTS install_token TEXT,
  ADD COLUMN IF NOT EXISTS installed_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS downloads_install_token_idx
  ON public.downloads(install_token)
  WHERE install_token IS NOT NULL;
