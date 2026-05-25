CREATE TABLE public.user_public_keys (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_public_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read any public key"
  ON public.user_public_keys FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can manage own public key"
  ON public.user_public_keys FOR ALL
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


CREATE TABLE public.pwlap_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.telemetry_sessions(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  granularity TEXT NOT NULL,
  encrypted BOOLEAN NOT NULL DEFAULT false,
  signed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pwlap_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own imports"
  ON public.pwlap_imports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own imports"
  ON public.pwlap_imports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);


-- Set up pwlap_exports storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pwlap_exports', 'pwlap_exports', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can select own exports"
  ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'pwlap_exports' AND auth.uid() = owner);

CREATE POLICY "Users can insert own exports"
  ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'pwlap_exports' AND auth.uid() = owner);

CREATE POLICY "Users can delete own exports"
  ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'pwlap_exports' AND auth.uid() = owner);
