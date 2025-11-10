-- Criar tabela para rastrear nível de amizade com Wandinha
CREATE TABLE IF NOT EXISTS public.wandinha_friendship (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  friendship_level integer NOT NULL DEFAULT 0,
  last_interaction timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.wandinha_friendship ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view their own friendship level"
  ON public.wandinha_friendship
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert friendship records"
  ON public.wandinha_friendship
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update friendship records"
  ON public.wandinha_friendship
  FOR UPDATE
  USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_wandinha_friendship_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wandinha_friendship_timestamp
  BEFORE UPDATE ON public.wandinha_friendship
  FOR EACH ROW
  EXECUTE FUNCTION update_wandinha_friendship_updated_at();