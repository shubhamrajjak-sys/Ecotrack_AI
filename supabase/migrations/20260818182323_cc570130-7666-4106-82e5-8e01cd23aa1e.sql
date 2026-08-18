CREATE TYPE public.app_role AS ENUM ('student','faculty','admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Eco User',
  department TEXT,
  campus TEXT,
  role_type TEXT NOT NULL DEFAULT 'student',
  onboarded BOOLEAN NOT NULL DEFAULT false,
  eco_points INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  reduction_target_pct NUMERIC NOT NULL DEFAULT 20,
  share_on_leaderboard BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.emission_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  factor NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  source TEXT NOT NULL,
  methodology TEXT,
  UNIQUE (category, key)
);
GRANT SELECT ON public.emission_factors TO authenticated, anon;
GRANT ALL ON public.emission_factors TO service_role;
ALTER TABLE public.emission_factors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "factors_public_read" ON public.emission_factors FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "factors_admin_write" ON public.emission_factors FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.emission_factors (category,key,label,factor,unit,source,methodology) VALUES
('transport','walking','Walking',0,'kg CO2e/km','IPCC AR6 / DEFRA 2023','Zero direct operational emissions.'),
('transport','bicycle','Bicycle',0,'kg CO2e/km','IPCC AR6 / DEFRA 2023','Zero direct operational emissions.'),
('transport','bus','Bus',0.105,'kg CO2e/km','DEFRA 2023 average local bus','Per passenger-km, average occupancy.'),
('transport','train','Train / Metro',0.041,'kg CO2e/km','DEFRA 2023 light rail & metro','Per passenger-km, grid-average electricity.'),
('transport','two_wheeler','Two-wheeler',0.089,'kg CO2e/km','India GHG Program','Petrol motorcycle, single rider.'),
('transport','auto','Auto rickshaw',0.107,'kg CO2e/km','India GHG Program','CNG three-wheeler, average occupancy.'),
('transport','car','Car',0.171,'kg CO2e/km','DEFRA 2023 average car','Per vehicle-km, petrol, single occupancy.'),
('energy','grid_electricity','Grid electricity',0.716,'kg CO2e/kWh','CEA India CO2 Baseline Database v19','National grid average emission factor.'),
('food','vegetarian','Vegetarian meal',0.72,'kg CO2e/meal','Poore & Nemecek (2018), Science','Average per-meal lifecycle emissions.'),
('food','mixed','Mixed diet meal',1.65,'kg CO2e/meal','Poore & Nemecek (2018), Science','Average per-meal lifecycle emissions.'),
('food','high_meat','High meat meal',3.2,'kg CO2e/meal','Poore & Nemecek (2018), Science','Average per-meal lifecycle emissions.'),
('food','vegan','Vegan meal',0.51,'kg CO2e/meal','Poore & Nemecek (2018), Science','Average per-meal lifecycle emissions.'),
('waste','landfill','Mixed landfill waste',0.58,'kg CO2e/kg','DEFRA 2023 waste disposal','Mixed municipal waste to landfill.'),
('waste','recycled','Recycled waste',0.021,'kg CO2e/kg','DEFRA 2023 closed-loop recycling','Processing emissions only.'),
('waste','compost','Composted organic waste',0.01,'kg CO2e/kg','DEFRA 2023 composting','Managed aerobic composting.');

CREATE TABLE public.carbon_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  period TEXT NOT NULL DEFAULT 'monthly',
  transport_kg NUMERIC NOT NULL DEFAULT 0,
  energy_kg NUMERIC NOT NULL DEFAULT 0,
  food_kg NUMERIC NOT NULL DEFAULT 0,
  waste_kg NUMERIC NOT NULL DEFAULT 0,
  total_kg NUMERIC NOT NULL DEFAULT 0,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carbon_calculations TO authenticated;
GRANT ALL ON public.carbon_calculations TO service_role;
ALTER TABLE public.carbon_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calc_own" ON public.carbon_calculations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.travel_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  origin_label TEXT NOT NULL,
  destination_label TEXT NOT NULL,
  distance_km NUMERIC NOT NULL,
  mode TEXT NOT NULL,
  trips_per_week INTEGER NOT NULL DEFAULT 1,
  distance_source TEXT NOT NULL DEFAULT 'manual',
  co2e_kg NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.travel_records TO authenticated;
GRANT ALL ON public.travel_records TO service_role;
ALTER TABLE public.travel_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "travel_own" ON public.travel_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'transport',
  target_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg CO2e',
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_own" ON public.goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  badge_code TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_own" ON public.achievements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  impact_kg NUMERIC NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'rules',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendations TO authenticated;
GRANT ALL ON public.recommendations TO service_role;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recs_own" ON public.recommendations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.leaderboard(_limit INTEGER DEFAULT 20)
RETURNS TABLE (display_name TEXT, department TEXT, eco_points INTEGER, streak_days INTEGER)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.display_name, p.department, p.eco_points, p.streak_days
  FROM public.profiles p
  WHERE p.share_on_leaderboard
  ORDER BY p.eco_points DESC
  LIMIT _limit
$$;
GRANT EXECUTE ON FUNCTION public.leaderboard(INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.campus_analytics()
RETURNS TABLE (participants BIGINT, total_kg NUMERIC, transport_kg NUMERIC, energy_kg NUMERIC, food_kg NUMERIC, waste_kg NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(DISTINCT user_id), COALESCE(SUM(total_kg),0), COALESCE(SUM(transport_kg),0),
         COALESCE(SUM(energy_kg),0), COALESCE(SUM(food_kg),0), COALESCE(SUM(waste_kg),0)
  FROM public.carbon_calculations
$$;
GRANT EXECUTE ON FUNCTION public.campus_analytics() TO authenticated;