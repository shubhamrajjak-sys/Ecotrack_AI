REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.leaderboard(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leaderboard(INTEGER) TO authenticated;
REVOKE ALL ON FUNCTION public.campus_analytics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.campus_analytics() TO authenticated;