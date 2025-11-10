-- Atualizar foto da Wandinha
UPDATE public.users 
SET photo_url = 'https://oguaxeiztwofmxaiidza.supabase.co/storage/v1/object/public/avatars/wandinha-profile.jpg'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Adicionar coluna reply_to_id na tabela messages para referenciar mensagens respondidas
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS reply_to_id bigint REFERENCES public.messages(id) ON DELETE SET NULL;