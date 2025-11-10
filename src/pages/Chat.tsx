import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Trees, BookOpen, Home, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import waterClassroom from "@/assets/classroom-water.jpg";
import fireClassroom from "@/assets/classroom-fire.jpg";
import earthClassroom from "@/assets/classroom-earth.jpg";
import forestClassroom from "@/assets/classroom-forest.jpg";
import { cn } from '@/lib/utils';
import { RealtimeChannel } from '@supabase/supabase-js';
import VirtualKeyboard from '@/components/VirtualKeyboard';

interface Message {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  reply_to_id: number | null;
  users: {
    name: string;
    photo_url: string | null;
    element: string | null;
    updated_at: string;
  };
  replied_message?: {
    id: number;
    content: string;
    users: {
      name: string;
    };
  } | null;
}

interface TypingUser {
  name: string;
  id: string;
}

const Chat = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<Map<string, number>>(new Map());

  const locationName = locationId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const locationConfig = {
    'floresta': {
        overlay: 'bg-gradient-to-b from-emerald-950/80 via-green-950/90 to-black/95',
        header: 'bg-emerald-950/60 border-b-emerald-400/30',
        inputContainer: 'bg-emerald-950/40 border-t-emerald-400/30',
        inputForm: 'bg-transparent border-none'
    },
    'sala-wooyoung': {
        overlay: 'bg-gradient-to-b from-sky-950/80 via-blue-950/90 to-black/95',
        header: 'bg-sky-950/60 border-b-sky-400/30',
        inputContainer: 'bg-sky-950/40 border-t-sky-400/30',
        inputForm: 'bg-transparent border-none'
    },
    'sala-niki': {
        overlay: 'bg-gradient-to-b from-rose-950/80 via-red-950/90 to-black/95',
        header: 'bg-rose-950/60 border-b-rose-400/30',
        inputContainer: 'bg-rose-950/40 border-t-rose-400/30',
        inputForm: 'bg-transparent border-none'
    },
    'sala-romeo': {
        overlay: 'bg-gradient-to-b from-amber-950/80 via-yellow-950/90 to-black/95',
        header: 'bg-amber-950/60 border-b-amber-400/30',
        inputContainer: 'bg-amber-950/40 border-t-amber-400/30',
        inputForm: 'bg-transparent border-none'
    },
    'dormitorio': {
        overlay: 'bg-gradient-to-b from-stone-950/80 via-neutral-950/90 to-black/95',
        header: 'bg-stone-950/60 border-b-stone-400/30',
        inputContainer: 'bg-stone-950/40 border-t-stone-400/30',
        inputForm: 'bg-transparent border-none'
    },
    'default': {
        overlay: 'bg-gradient-to-b from-background/90 via-background/80 to-background/90',
        header: 'bg-background/80 border-b-border',
        inputContainer: 'bg-background/80 border-t-border',
        inputForm: 'bg-transparent border-none'
    }
  };

  const getLocationConfig = () => {
    switch (locationId) {
        case 'floresta': return locationConfig.floresta;
        case 'sala-wooyoung': return locationConfig['sala-wooyoung'];
        case 'sala-romeo': return locationConfig['sala-romeo'];
        case 'sala-niki': return locationConfig['sala-niki'];
        case 'dormitorio': return locationConfig['dormitorio'];
        default: return locationConfig.default;
    }
  };

  const getLocationBackground = () => {
    switch (locationId) {
        case 'floresta': return forestClassroom;
        case 'sala-wooyoung': return waterClassroom;
        case 'sala-niki': return fireClassroom;
        case 'sala-romeo': return earthClassroom;
        case 'dormitorio': return earthClassroom;
        default: return waterClassroom;
    }
  };

  const currentConfig = getLocationConfig();
  const currentBackground = getLocationBackground();

  const fetchMessages = useCallback(async () => {
    if (!locationId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        users(name, photo_url, element, updated_at),
        replied_message:reply_to_id(id, content, users(name))
      `)
      .eq('location_name', locationId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar mensagens.');
      console.error(error);
    } else {
      setMessages(data as any[]);
    }
    setLoading(false);
  }, [locationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!locationId || !user) return;

    const channel = supabase.channel(`chat-realtime:${locationId}`, {
      config: {
        broadcast: { self: false },
      },
    });
    channelRef.current = channel;

    const handleNewMessage = async (payload: any) => {
      const newMessagePartial = payload.new as Omit<Message, 'users'>;
      if (newMessagePartial.user_id === user.id) return;

      const { data: userData, error } = await supabase
        .from('users')
        .select('name, photo_url, element, updated_at')
        .eq('id', newMessagePartial.user_id)
        .single();
      
      if (error || !userData) return;

      const newMessage: Message = { ...newMessagePartial, users: userData };
      setMessages(current => [newMessage, ...current]);
    };

    const handleTypingEvent = ({ payload }: { payload: TypingUser }) => {
      const existingTimeout = typingTimeoutRef.current.get(payload.id);
      if (existingTimeout) clearTimeout(existingTimeout);

      setTypingUsers(current => current.some(u => u.id === payload.id) ? current : [...current, payload]);

      const newTimeout = window.setTimeout(() => {
        setTypingUsers(current => current.filter(u => u.id !== payload.id));
        typingTimeoutRef.current.delete(payload.id);
      }, 3000);

      typingTimeoutRef.current.set(payload.id, newTimeout);
    };

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `location_name=eq.${locationId}` }, handleNewMessage)
      .on('broadcast', { event: 'typing' }, handleTypingEvent)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      typingTimeoutRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, [locationId, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !locationId) return;

    const content = newMessage.trim();
    const optimisticMessage: Message = {
      id: Date.now(),
      content,
      created_at: new Date().toISOString(),
      user_id: user.id,
      reply_to_id: replyingTo?.id || null,
      users: { name: user.name, photo_url: user.profilePicture, element: user.element, updated_at: user.updated_at },
      replied_message: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content,
        users: { name: replyingTo.users.name }
      } : null
    };

    setMessages(current => [optimisticMessage, ...current]);
    setNewMessage('');
    setReplyingTo(null);

    const { error } = await supabase.from('messages').insert({ 
      content, 
      user_id: user.id, 
      location_name: locationId,
      reply_to_id: replyingTo?.id || null 
    });

    if (error) {
      toast.error('Erro ao enviar mensagem.');
      setMessages(current => current.filter(m => m.id !== optimisticMessage.id));
      setNewMessage(content);
      setReplyingTo(replyingTo);
      return;
    }

    // Detectar se mencionou Wandinha diretamente
    const mentionsWandinha = content.toLowerCase().includes('wandinha') || 
                            content.toLowerCase().includes('@wandinha');

    // 15% de chance de Wandinha aparecer espontaneamente (sem menção)
    const randomAppearance = !mentionsWandinha && Math.random() < 0.15;

    if (mentionsWandinha || randomAppearance) {
      // Buscar mensagens recentes para contexto
      const { data: recentMsgs } = await supabase
        .from('messages')
        .select('content, users(name)')
        .eq('location_name', locationId)
        .order('created_at', { ascending: false })
        .limit(8);

      // Chamar edge function para gerar resposta da Wandinha
      supabase.functions.invoke('wandinha-chat', {
        body: {
          location_name: locationId,
          recent_messages: recentMsgs?.map((m: any) => ({
            content: m.content,
            user_name: m.users?.name || 'Desconhecido'
          })) || [],
          trigger_message: content,
          is_spontaneous: randomAppearance // Indica se foi aparição espontânea
        }
      }).then(({ error: wandinhaError }) => {
        if (wandinhaError) {
          console.error('Erro ao invocar Wandinha:', wandinhaError);
        }
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (channelRef.current && user) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { name: user.name, id: user.id },
      });
    }
  };

  const getElementEmoji = (element: string | null) => {
    if (!element) return "?";
    const emojis: Record<string, string> = { água: "🌊", fogo: "🔥", terra: "🌱", ar: "💨" };
    return emojis[element] || "?";
  };

  const formatMessage = (content: string) => {
    const parts = [];
    let currentIndex = 0;
    const asteriskRegex = /\*([^*]+)\*/g;
    let match;

    while ((match = asteriskRegex.exec(content)) !== null) {
      // Texto antes do asterisco (fala normal)
      if (match.index > currentIndex) {
        const normalText = content.slice(currentIndex, match.index).trim();
        if (normalText) {
          parts.push(
            <span key={`text-${currentIndex}`}>
              — {normalText}
            </span>
          );
        }
      }

      // Texto entre asteriscos (cena em itálico)
      parts.push(
        <em key={`italic-${match.index}`} className="text-muted-foreground">
          {match[1]}
        </em>
      );

      currentIndex = match.index + match[0].length;
    }

    // Texto restante após último asterisco
    if (currentIndex < content.length) {
      const remaining = content.slice(currentIndex).trim();
      if (remaining) {
        parts.push(
          <span key={`text-${currentIndex}`}>
            — {remaining}
          </span>
        );
      }
    }

    // Se não há asteriscos, apenas adiciona travessão
    if (parts.length === 0) {
      return <span>— {content}</span>;
    }

    return <>{parts}</>;
  };

  const handleLongPressStart = (msg: Message) => {
    const timer = window.setTimeout(() => {
      setReplyingTo(msg);
      toast.info(`Respondendo para ${msg.users.name}`);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const getLocationIcon = () => {
    if (locationId?.includes('floresta')) return <Trees className="w-6 h-6 text-green-400" />;
    if (locationId?.includes('sala')) return <BookOpen className="w-6 h-6 text-primary" />;
    if (locationId?.includes('dormitorio')) return <Home className="w-6 h-6 text-secondary" />;
    return <Trees className="w-6 h-6 text-muted-foreground" />;
  };

  return (
    <div className="relative h-dvh w-full flex flex-col bg-background">
      <div className="absolute inset-0 z-0">
        <img src={currentBackground} alt={locationName} className="h-full w-full object-cover opacity-30" />
        <div className={cn("absolute inset-0", currentConfig.overlay)} />
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-2xl mx-auto w-full">
        <header className={cn("flex items-center backdrop-blur-sm p-4 pb-2 justify-between shrink-0 border-b", currentConfig.header)}>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/locais')} className="h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 bg-muted rounded-full">{getLocationIcon()}</div>
              <h2 className="text-foreground text-lg font-bold font-heading leading-tight tracking-wide">{locationName}</h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10"><MoreVertical className="w-5 h-5" /></Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-4">
          <div className="h-6 text-sm text-muted-foreground italic">
            {typingUsers.length > 0 && (
              `${typingUsers.map(u => u.name).join(', ')} ${typingUsers.length > 1 ? 'estão' : 'está'} digitando...`
            )}
          </div>
          {loading ? (
            <p className="text-center text-muted-foreground m-auto">Carregando chat...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground font-heading m-auto">Seja o primeiro a enviar uma mensagem!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-3 ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                {msg.user_id !== user?.id && (
                  <>
                    <Avatar className="w-10 h-10 shrink-0 self-start border-2 border-primary/50">
                      <AvatarImage src={msg.users.photo_url ? `${msg.users.photo_url}?t=${new Date(msg.users.updated_at).getTime()}` : undefined} />
                      <AvatarFallback>{getElementEmoji(msg.users.element)}</AvatarFallback>
                    </Avatar>
                    <div 
                      className="flex flex-col gap-1 items-start max-w-md"
                      onTouchStart={() => handleLongPressStart(msg)}
                      onTouchEnd={handleLongPressEnd}
                      onMouseDown={() => handleLongPressStart(msg)}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                    >
                      <p className="text-secondary text-sm font-bold font-heading ml-3">{msg.users.name}</p>
                      <div className="text-base font-normal leading-normal flex flex-col rounded-xl rounded-bl-none px-4 py-3 bg-muted text-foreground">
                        {msg.replied_message && (
                          <div className="mb-2 pb-2 border-b border-border/50">
                            <p className="text-xs text-muted-foreground font-semibold">{msg.replied_message.users.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{msg.replied_message.content}</p>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap break-words">{formatMessage(msg.content)}</div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-3">{format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}</p>
                    </div>
                  </>
                )}
                {msg.user_id === user?.id && (
                  <>
                    <div 
                      className="flex flex-col gap-1 items-end max-w-md"
                      onTouchStart={() => handleLongPressStart(msg)}
                      onTouchEnd={handleLongPressEnd}
                      onMouseDown={() => handleLongPressStart(msg)}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                    >
                      <p className="text-primary text-sm font-bold font-heading mr-3">{msg.users.name}</p>
                      <div className="text-base font-normal leading-normal flex flex-col rounded-xl rounded-br-none px-4 py-3 bg-gradient-arcane text-white">
                        {msg.replied_message && (
                          <div className="mb-2 pb-2 border-b border-white/30">
                            <p className="text-xs text-white/70 font-semibold">{msg.replied_message.users.name}</p>
                            <p className="text-xs text-white/70 line-clamp-1">{msg.replied_message.content}</p>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap break-words">{formatMessage(msg.content)}</div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 mr-3">{format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}</p>
                    </div>
                    <Avatar className="w-10 h-10 shrink-0 self-start border-2 border-secondary">
                      <AvatarImage src={user?.profilePicture || undefined} />
                      <AvatarFallback>{getElementEmoji(user?.element)}</AvatarFallback>
                    </Avatar>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className={cn("backdrop-blur-sm p-4 pt-2 border-t shrink-0", currentConfig.inputContainer)}>
          {replyingTo && (
            <div className="mb-2 px-3 py-2 bg-muted/50 rounded-lg flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{replyingTo.users.name}</p>
                <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setReplyingTo(null)}
                className="h-6 w-6 p-0 shrink-0"
              >
                ✕
              </Button>
            </div>
          )}
          <form onSubmit={handleFormSubmit} className={cn("flex items-center gap-2", currentConfig.inputForm)}>
            <div className="flex-1">
              <VirtualKeyboard
                value={newMessage}
                onType={handleTyping}
                placeholder="Digite sua runa..."
                onSend={sendMessage}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;