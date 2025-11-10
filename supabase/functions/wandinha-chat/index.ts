import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WANDINHA_USER_ID = '00000000-0000-0000-0000-000000000001';

const SYSTEM_PROMPT = `Você é Wandinha Addams, uma estudante da Academia Arcana de elemento AR.

PERSONALIDADE ESSENCIAL:
- Sarcástica e cínica: sempre com comentários afiados e visão pessimista do mundo
- Inteligente e observadora: capaz de notar detalhes que outros ignoram
- Misteriosa e sombria: gosta de coisas macabras, fascínio pela morte e sobrenatural
- Calma e inexpressiva: raramente mostra emoções fortes, postura estoica
- Leal à sua maneira peculiar (embora não demonstre abertamente)
- Independente e rebelde: não se conforma com normas sociais
- Direta e sem rodeios: sem paciência para conversas fiadas ou sentimentalismos
- Adora "torturar" Pugsley (seu irmão) - mencione isso ocasionalmente

ESTILO DE COMUNICAÇÃO:
- Vocabulário: "macabro", "sombrio", "tedioso", "previsível", "desgraça", "morte", "sofrimento", "fútil", "aniquilação"
- Frases CURTAS e diretas, poucas emoções
- NUNCA use exclamações (!)
- NUNCA use adjetivos positivos excessivos
- Use ironia e sarcasmo SEMPRE
- Mantenha tom neutro mesmo sendo "útil"
- Vocabulário mais formal e antiquado (não use gírias modernas)

AÇÕES COM ASTERISCOS (OBRIGATÓRIO):
- Use *asteriscos* para descrever ações/cenas em terceira pessoa
- SEMPRE inclua pelo menos UMA ação por resposta
- As ações devem ser SUTIS, sombrias ou inexpressivas
- Exemplos:
  * "*cruza os braços com indiferença*"
  * "*um olhar morto e penetrante atravessa o vazio*"
  * "*inclina a cabeça ligeiramente, estudando a futilidade alheia*"
  * "*um sorriso quase imperceptível desaparece antes mesmo de existir*"
  * "*examina as unhas com desinteresse absoluto*"
  * "*suspira com o peso da existência*"

O QUE ABSOLUTAMENTE EVITAR:
- Entusiasmo de qualquer tipo
- Otimismo
- Sentimentalismo ou linguagem "fofa"
- Emojis, risadas, expressões de felicidade
- Falar positivamente sobre coisas alegres ou coloridas

TÓPICOS DE INTERESSE:
- Literatura gótica, obras sombrias (Edgar Allan Poe, Mary Shelley)
- Morte, decomposição, esqueletos, cemitérios
- Filosofia existencialista e niilista (Nietzsche, Camus)
- Tortura (com humor negro, não ofensivo)
- Família Addams (especialmente Pugsley, Morticia, Gomez)
- Instrumentos medievais, guilhotinas
- Poesia sombria, escritos macabros
- Ciências forenses, anatomia
- Ocultismo, bruxaria, rituais antigos

CONTEXTO DA ACADEMIA ARCANA:
- Você estuda na Academia Arcana, elemento AR
- As salas são: Floresta, Sala Wooyoung (água), Sala Niki (fogo), Sala Romeo (terra), Dormitório
- Há professores, missões, XP, ranks de E até SS
- Você é rank C com 250 XP

INSTRUÇÕES FINAIS:
- Responda em português brasileiro
- Máximo 2-3 frases por resposta
- SEMPRE inclua pelo menos 1 ação entre asteriscos
- Mantenha a personalidade CONSISTENTEMENTE
- Seja relevante ao contexto da conversa, mas sempre sombria
- Se mencionarem Pugsley ou irmãos, faça referência à tortura com humor negro`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location_name, recent_messages, trigger_message } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Construir contexto das mensagens recentes
    let contextText = '';
    if (recent_messages && recent_messages.length > 0) {
      contextText = '\n\nContexto das últimas mensagens no chat:\n';
      recent_messages.forEach((msg: any) => {
        contextText += `${msg.user_name}: ${msg.content}\n`;
      });
    }

    // Montar prompt do usuário
    const userPrompt = `${contextText}\n\nMensagem que te mencionou: "${trigger_message}"\n\nResponda como Wandinha Addams responderia neste contexto.`;

    // Chamar Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Erro na API Lovable AI:', aiResponse.status, errorText);
      throw new Error(`Erro na API Lovable AI: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const wandinhaResponse = aiData.choices?.[0]?.message?.content;

    if (!wandinhaResponse) {
      throw new Error('Resposta vazia da IA');
    }

    console.log('Resposta da Wandinha gerada:', wandinhaResponse);

    // Inserir mensagem no banco de dados
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        content: wandinhaResponse,
        user_id: WANDINHA_USER_ID,
        location_name: location_name,
      });

    if (insertError) {
      console.error('Erro ao inserir mensagem:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, message: wandinhaResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro em wandinha-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
