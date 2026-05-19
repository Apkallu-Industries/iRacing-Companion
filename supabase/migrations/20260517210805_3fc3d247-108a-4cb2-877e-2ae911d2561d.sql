
-- Community-shared tables: private by default, anyone can SELECT when published=true

CREATE TABLE public.shared_gear_ratios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  car text NOT NULL,
  name text,
  ratios jsonb NOT NULL,
  samples jsonb,
  published boolean NOT NULL DEFAULT false,
  votes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, car)
);

CREATE TABLE public.shared_channel_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  layout jsonb NOT NULL,
  published boolean NOT NULL DEFAULT false,
  votes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.shared_car_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  car text NOT NULL,
  car_class text NOT NULL,
  confidence numeric,
  published boolean NOT NULL DEFAULT false,
  votes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, car)
);

CREATE TABLE public.community_votes (
  user_id uuid NOT NULL,
  target_id uuid NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, target_id, kind)
);

ALTER TABLE public.shared_gear_ratios     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_channel_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_car_classes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_votes        ENABLE ROW LEVEL SECURITY;

-- shared_gear_ratios policies
CREATE POLICY "View published or own gear ratios" ON public.shared_gear_ratios
  FOR SELECT TO authenticated USING (published = true OR auth.uid() = user_id);
CREATE POLICY "Insert own gear ratios" ON public.shared_gear_ratios
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own gear ratios" ON public.shared_gear_ratios
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own gear ratios" ON public.shared_gear_ratios
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- shared_channel_layouts policies
CREATE POLICY "View published or own layouts" ON public.shared_channel_layouts
  FOR SELECT TO authenticated USING (published = true OR auth.uid() = user_id);
CREATE POLICY "Insert own layouts" ON public.shared_channel_layouts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own layouts" ON public.shared_channel_layouts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own layouts" ON public.shared_channel_layouts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- shared_car_classes policies
CREATE POLICY "View published or own car classes" ON public.shared_car_classes
  FOR SELECT TO authenticated USING (published = true OR auth.uid() = user_id);
CREATE POLICY "Insert own car classes" ON public.shared_car_classes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own car classes" ON public.shared_car_classes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own car classes" ON public.shared_car_classes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- community_votes policies (one vote per user per target+kind)
CREATE POLICY "View all votes" ON public.community_votes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own vote" ON public.community_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own vote" ON public.community_votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- updated_at trigger fn (reuse pattern)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_sgr_touch BEFORE UPDATE ON public.shared_gear_ratios
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_scl_touch BEFORE UPDATE ON public.shared_channel_layouts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_scc_touch BEFORE UPDATE ON public.shared_car_classes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Indexes for community browse
CREATE INDEX idx_sgr_published_car ON public.shared_gear_ratios (car, votes DESC) WHERE published = true;
CREATE INDEX idx_scl_published     ON public.shared_channel_layouts (votes DESC) WHERE published = true;
CREATE INDEX idx_scc_published_car ON public.shared_car_classes (car, votes DESC) WHERE published = true;
