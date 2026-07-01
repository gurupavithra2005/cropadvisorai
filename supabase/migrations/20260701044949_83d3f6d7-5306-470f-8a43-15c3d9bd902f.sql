
CREATE TYPE public.app_role AS ENUM ('admin', 'officer', 'farmer');
CREATE TYPE public.land_type AS ENUM ('dry', 'wet', 'garden');
CREATE TYPE public.irrigation_type AS ENUM ('borewell', 'canal', 'rainfed', 'drip', 'sprinkler');

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT, phone TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  village TEXT, district TEXT, state TEXT,
  latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
  land_size_acres NUMERIC,
  land_type public.land_type,
  irrigation public.irrigation_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles select" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.phone);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'farmer');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.soil_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nitrogen NUMERIC, phosphorus NUMERIC, potassium NUMERIC,
  ph NUMERIC, organic_carbon NUMERIC, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soil_reports TO authenticated;
GRANT ALL ON public.soil_reports TO service_role;
ALTER TABLE public.soil_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own soil" ON public.soil_reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.pest_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT, crop TEXT, diagnosis TEXT, severity TEXT, treatment TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pest_scans TO authenticated;
GRANT ALL ON public.pest_scans TO service_role;
ALTER TABLE public.pest_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own scans" ON public.pest_scans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.advisories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  input JSONB, output JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advisories TO authenticated;
GRANT ALL ON public.advisories TO service_role;
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own adv" ON public.advisories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.market_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commodity TEXT NOT NULL, market TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, commodity, market)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_watchlist TO authenticated;
GRANT ALL ON public.market_watchlist TO service_role;
ALTER TABLE public.market_watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own watch" ON public.market_watchlist FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
