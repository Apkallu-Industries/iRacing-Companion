
ALTER FUNCTION public.prevent_votes_update() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.set_community_votes(text, uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_community_votes(text, uuid, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_community_votes(text, uuid, integer) TO authenticated;
