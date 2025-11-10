-- Corrigir search_path da função update_wandinha_friendship_updated_at
DROP TRIGGER IF EXISTS update_wandinha_friendship_timestamp ON public.wandinha_friendship;
DROP FUNCTION IF EXISTS update_wandinha_friendship_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_wandinha_friendship_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_wandinha_friendship_timestamp
  BEFORE UPDATE ON public.wandinha_friendship
  FOR EACH ROW
  EXECUTE FUNCTION update_wandinha_friendship_updated_at();