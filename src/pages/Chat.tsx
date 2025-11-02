import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Trees, BookOpen, Home, MoreVertical, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import heroImage from "@/assets/academy-hero-enhanced.jpg";
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    name: string;
    photo_url: string | null;
    element: string | null;
  };
}

const Chat = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const locationName = locationId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const locationConfig = {
    'floresta': {
        overlay: 'bg-gradient-to-b from-emerald-950/80 via-green-950/90 to-black/95',
        header: 'bg-emerald-950/60 border-b-emerald-400/30',
        inputContainer: 'bg-emerald-950/40 border-t-emerald-400/30',
        inputForm: 'bg-emerald-950/50 border-emerald-400/40'
    },
    'sala-wooyoung': {
        overlay: 'bg-gradient-to-b from-sky-950/80 via-blue-950/90 to-black/95',
        header: 'bg-sky-950/60 border-b-sky-400/30',
        inputContainer: 'bg-sky-950/40 border-t-sky-400/30',
        inputForm: 'bg-sky-950/50 border-sky-400/40'
    },
    'sala-romeo': {
        overlay: 'bg-gradient-to-b from-rose-950/80 via-red-950/90 to-black/95',
        header: 'bg-rose-950/60 border-b-rose-400/30',
        inputContainer: 'bg-rose-950/40 border-t-rose-400/30',
        inputForm: 'bg-rose-950/50 border-rose-400/40'
    },
    'sala-niki': {
        overlay: 'bg-gradient-to-b from-amber-950/80 via-yellow-950/90 to-black/95',
        header: 'bg-amber-950/60 border-b-amber-400/30',
        inputContainer: 'bg-amber-950/40 border-t-amber-400/30',
        inputForm: 'bg-amber-950/50 border-amber-400/40'
    },
    'default': {
        overlay: 'bg-gradient-to-b from-background/90 via-background/80 to-background/90',
        header: 'bg-background/80 border-b-border',
        inputContainer: 'bg-background/80 border-t-border',
        inputForm: 'bg-muted/50 border-border'
    }
  };

  const getLocationConfig = () => {
    switch (locationId) {
        case 'floresta': return locationConfig.floresta;
        case 'sala-wooyoung': return locationConfig['sala-wooyoung'];
        case 'sala-romeo': return locationConfig['sala-romeo'];
        case 'sala-niki': return locationConfig['sala-niki'];
        default: return locationConfig.default;
    }
  };

  const currentConfig = getLocationConfig();

  const fetchMessages = useCallback(async () => {
    if (!locationId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*, users(name, photo_url, element)')
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
    if (!locationId) return;

    const handleNewMessage = async (payload: any) => {
      const newMessagePartial = payload.new as Omit<Message, 'users'>;

      const { data: userData, error } = await supabase
        .from('users')
        .select('name, photo_url, element')
        .eq('id', newMessagePartial.user_id)
        .single();
      
      if (error || !userData) {
        console.error("Não foi possível buscar os dados do usuário para a nova mensagem", error);
        return;
      }

      const newMessage: Message = {
        ...newMessagePartial,
        users: userData,
      };

      setMessages(currentMessages => {
        if (currentMessages.some(m => m.id === newMessage.id)) {
          return currentMessages;
        }
        return [newMessage, ...currentMessages];
      });
    };

    const channel = supabase
      .channel(`chat-realtime:${locationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `location_name=eq.${locationId}` },
        handleNewMessage
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [locationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !locationId) return;

    const content = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase.from('messages').insert({
      content,
      user_id: user.id,
      location_name: locationId,
    });

    if (error) {
      toast.error('Erro ao enviar mensagem.');
      console.error(error);
      setNewMessage(content);
    }
  };

  const getElementEmoji = (element: string | null) => {
    if (!element) return "?";
    const emojis: Record<string, string> = { água: "🌊", fogo: "🔥", terra: "🌱", ar: "💨" };
    return emojis[element] || "?";
  };

  const getLocationIcon = () => {
    if (locationId?.includes('floresta')) return <Trees className="w-6 h-6 text-green-400" />;
    if (locationId?.includes('sala')) return <BookOpen className="w-6 h-6 text-primary" />;
    if (locationId?.includes('dormitorio')) return <Home className="w-6 h-6 text-secondary" />;
    return <Trees className="w-6 h-6 text-muted-foreground" />;
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-background">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Academia Arcana" className="h-full w-full object-cover opacity-20" />
        <div className={cn("absolute inset-0", currentConfig.overlay)} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full max-w-2xl mx-auto w-full">
        {/* Header */}
        <header className={cn("flex items-center backdrop-blur-sm p-4 pb-2 justify-between shrink-0 border-b", currentConfig.header)}>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/locais')} className="h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 bg-muted rounded-full">
                {getLocationIcon()}
              </div>
              <h2 className="text-foreground text-lg font-bold font-heading leading-tight tracking-wide">{locationName}</h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Carregando chat...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground font-heading">Seja o primeiro a enviar uma mensagem!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-3 ${msg.user_id === user?.id ? 'justify-end' : ''}`}>
                {/* Other User's Message */}
                {msg.user_id !== user?.id && (
                  <>
                    <Avatar className="w-10 h-10 shrink-0 self-start border-2 border-primary/50">
                      <AvatarImage src={msg.users.photo_url || undefined} />
                      <AvatarFallback>{getElementEmoji(msg.users.element)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1 items-start max-w-md">
                      <p className="text-secondary text-sm font-bold font-heading ml-3">{msg.users.name}</p>
                      <div className="text-base font-normal leading-normal flex rounded-xl rounded-bl-none px-4 py-3 bg-muted text-foreground">
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                       <p className="text-xs text-muted-foreground mt-1 ml-3">
                        {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </>
                )}
                {/* Current User's Message */}
                {msg.user_id === user?.id && (
                  <>
                    <div className="flex flex-col gap-1 items-end max-w-md">
                      <p className="text-primary text-sm font-bold font-heading mr-3">{msg.users.name}</p>
                      <div className="text-base font-normal leading-normal flex rounded-xl rounded-br-none px-4 py-3 bg-gradient-arcane text-white">
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                       <p className="text-xs text-muted-foreground mt-1 mr-3">
                        {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                      </p>
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

        {/* Input Bar */}
        <div className={cn("backdrop-blur-sm p-4 pt-2 border-t shrink-0", currentConfig.inputContainer)}>
          <form onSubmit={handleSendMessage} className={cn("flex items-center gap-2 border rounded-full px-2 py-1.5", currentConfig.inputForm)}>
            <Button type="button" variant="ghost" size="icon" className="text-primary hover:bg-primary/20 rounded-full shrink-0">
              <PlusCircle className="w-5 h-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua runa..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground border-none focus:ring-0 p-2 text-base"
            />
            <Button type="submit" size="icon" className="bg-gradient-arcane text-white rounded-full shrink-0 w-10 h-10 shadow-glow hover:opacity-90">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;