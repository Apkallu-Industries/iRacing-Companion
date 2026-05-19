
-- 1) Prevent direct manipulation of votes column via UPDATE.
-- Replace UPDATE policies with WITH CHECK that pins votes to OLD.votes via trigger.

CREATE OR REPLACE FUNCTION public.prevent_votes_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.votes IS DISTINCT FROM OLD.votes THEN
    -- Only allow votes changes when running with elevated role (service_role)
    IF current_setting('request.jwt.claim.role', true) <> 'service_role'
       AND auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'votes column can only be modified by the voting service';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_votes_update_gear ON public.shared_gear_ratios;
CREATE TRIGGER prevent_votes_update_gear
BEFORE UPDATE ON public.shared_gear_ratios
FOR EACH ROW EXECUTE FUNCTION public.prevent_votes_update();

DROP TRIGGER IF EXISTS prevent_votes_update_layouts ON public.shared_channel_layouts;
CREATE TRIGGER prevent_votes_update_layouts
BEFORE UPDATE ON public.shared_channel_layouts
FOR EACH ROW EXECUTE FUNCTION public.prevent_votes_update();

DROP TRIGGER IF EXISTS prevent_votes_update_classes ON public.shared_car_classes;
CREATE TRIGGER prevent_votes_update_classes
BEFORE UPDATE ON public.shared_car_classes
FOR EACH ROW EXECUTE FUNCTION public.prevent_votes_update();

-- Update voteCommunityItem path: the server function uses the user's RLS client,
-- so we need a SECURITY DEFINER RPC to bump votes server-side.
CREATE OR REPLACE FUNCTION public.set_community_votes(_kind text, _target_id uuid, _votes integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF _kind = 'gear_ratios' THEN
    UPDATE public.shared_gear_ratios SET votes = _votes WHERE id = _target_id;
  ELSIF _kind = 'channel_layout' THEN
    UPDATE public.shared_channel_layouts SET votes = _votes WHERE id = _target_id;
  ELSIF _kind = 'car_class' THEN
    UPDATE public.shared_car_classes SET votes = _votes WHERE id = _target_id;
  ELSE
    RAISE EXCEPTION 'Unknown kind: %', _kind;
  END IF;
END;
$$;

-- Allow the function to bypass the trigger by setting role context.
-- Simpler: have the trigger allow updates when called via this definer function by
-- checking a session variable.
CREATE OR REPLACE FUNCTION public.prevent_votes_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.votes IS DISTINCT FROM OLD.votes THEN
    IF current_setting('app.allow_votes_update', true) <> 'on' THEN
      RAISE EXCEPTION 'votes column can only be modified by the voting service';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_community_votes(_kind text, _target_id uuid, _votes integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  PERFORM set_config('app.allow_votes_update', 'on', true);
  IF _kind = 'gear_ratios' THEN
    UPDATE public.shared_gear_ratios SET votes = _votes WHERE id = _target_id;
  ELSIF _kind = 'channel_layout' THEN
    UPDATE public.shared_channel_layouts SET votes = _votes WHERE id = _target_id;
  ELSIF _kind = 'car_class' THEN
    UPDATE public.shared_car_classes SET votes = _votes WHERE id = _target_id;
  ELSE
    RAISE EXCEPTION 'Unknown kind: %', _kind;
  END IF;
  PERFORM set_config('app.allow_votes_update', 'off', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_community_votes(text, uuid, integer) TO authenticated;

-- 2) Restrict shared_themes SELECT to authenticated users only.
DROP POLICY IF EXISTS "Anyone can view shared themes" ON public.shared_themes;
CREATE POLICY "Authenticated users can view shared themes"
ON public.shared_themes
FOR SELECT
TO authenticated
USING (true);
