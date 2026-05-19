CREATE OR REPLACE FUNCTION public.set_community_votes(_kind text, _target_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.community_votes
  WHERE target_id = _target_id AND kind = _kind;

  PERFORM set_config('app.allow_votes_update', 'on', true);
  IF _kind = 'gear_ratios' THEN
    UPDATE public.shared_gear_ratios SET votes = v_count WHERE id = _target_id;
  ELSIF _kind = 'channel_layout' THEN
    UPDATE public.shared_channel_layouts SET votes = v_count WHERE id = _target_id;
  ELSIF _kind = 'car_class' THEN
    UPDATE public.shared_car_classes SET votes = v_count WHERE id = _target_id;
  ELSE
    PERFORM set_config('app.allow_votes_update', 'off', true);
    RAISE EXCEPTION 'Unknown kind: %', _kind;
  END IF;
  PERFORM set_config('app.allow_votes_update', 'off', true);

  RETURN v_count;
END;
$function$;

-- Drop the old 3-arg signature so clients can't bypass with caller-supplied vote counts
DROP FUNCTION IF EXISTS public.set_community_votes(text, uuid, integer);