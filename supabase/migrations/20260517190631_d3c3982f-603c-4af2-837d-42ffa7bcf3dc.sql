
CREATE TABLE public.driver_fingerprint (
  user_id uuid NOT NULL,
  track text NOT NULL,
  car text NOT NULL,
  car_class text,
  best_ever_s numeric NOT NULL,
  optimal_ever_s numeric,
  median_best_s numeric,
  best_stdev_s numeric,
  best_lap_sectors jsonb,
  best_per_sector jsonb,
  track_length_m numeric,
  track_length_known boolean DEFAULT false,
  file_count integer NOT NULL DEFAULT 1,
  latest_build_date text,
  earliest_build_date text,
  trend text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, track, car)
);

ALTER TABLE public.driver_fingerprint ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own fingerprint"
  ON public.driver_fingerprint FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own fingerprint"
  ON public.driver_fingerprint FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own fingerprint"
  ON public.driver_fingerprint FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own fingerprint"
  ON public.driver_fingerprint FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_driver_fingerprint_user_track_car
  ON public.driver_fingerprint (user_id, track, car);

ALTER TABLE public.telemetry_sessions
  ADD COLUMN IF NOT EXISTS fingerprint_delta jsonb;
