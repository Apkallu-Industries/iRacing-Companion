REVOKE EXECUTE ON FUNCTION public.set_community_votes(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_community_votes(text, uuid) TO authenticated;