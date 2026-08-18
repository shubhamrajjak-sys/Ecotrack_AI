CREATE OR REPLACE FUNCTION public.campus_analytics()
 RETURNS TABLE(participants bigint, total_kg numeric, transport_kg numeric, energy_kg numeric, food_kg numeric, waste_kg numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT COUNT(DISTINCT user_id), COALESCE(SUM(total_kg),0), COALESCE(SUM(transport_kg),0),
         COALESCE(SUM(energy_kg),0), COALESCE(SUM(food_kg),0), COALESCE(SUM(waste_kg),0)
  FROM public.carbon_calculations
  WHERE (SELECT auth.uid()) IS NOT NULL
$function$;

CREATE OR REPLACE FUNCTION public.leaderboard(_limit integer DEFAULT 20)
 RETURNS TABLE(display_name text, department text, eco_points integer, streak_days integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT p.display_name, p.department, p.eco_points, p.streak_days
  FROM public.profiles p
  WHERE p.share_on_leaderboard
    AND (SELECT auth.uid()) IS NOT NULL
  ORDER BY p.eco_points DESC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 20), 1), 100)
$function$;

REVOKE ALL ON FUNCTION public.campus_analytics() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leaderboard(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.campus_analytics() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.leaderboard(integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;