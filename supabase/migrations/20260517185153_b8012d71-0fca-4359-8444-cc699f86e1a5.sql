CREATE TABLE public.live_lap_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track TEXT NOT NULL,
  car TEXT NOT NULL,
  lap_time_s NUMERIC NOT NULL,
  s1_s NUMERIC,
  s2_s NUMERIC,
  s3_s NUMERIC,
  max_brake_pct NUMERIC,
  max_throttle_pct NUMERIC,
  peak_lat_g NUMERIC,
  peak_lon_g NUMERIC,
  tire_avg_c NUMERIC,
  fuel_used_l NUMERIC,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.live_lap_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own live laps"
  ON public.live_lap_records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own live laps"
  ON public.live_lap_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own live laps"
  ON public.live_lap_records FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own live laps"
  ON public.live_lap_records FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_live_laps_pb ON public.live_lap_records (user_id, track, car, lap_time_s ASC) WHERE is_valid;
CREATE INDEX idx_live_laps_recent ON public.live_lap_records (user_id, recorded_at DESC);