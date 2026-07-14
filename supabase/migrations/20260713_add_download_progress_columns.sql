ALTER TABLE public.downloads
  ADD COLUMN IF NOT EXISTS downloaded_bytes BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_bytes BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS progress_percent INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS elapsed_seconds INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS downloads_progress_idx
  ON public.downloads(progress_percent, completed);
