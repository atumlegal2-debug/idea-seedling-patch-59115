import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Trees, BookOpen, Home, MoreVertical, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, isSameDay, isToday, isYesterday, formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import heroImage from "@/assets/academy-hero-enhanced.jpg";
import { cn } from '@/lib/utils';
import { RealtimeChannel } from '@supabase/supabase-js';

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

interface TypingUser {
  name: string;
  id: string;
}

const forestBg = "https://lh3.googleusercontent.com/aida-public/AB6AXuA6EcV_cdbKpefluoFtaUxWdGDcF3qctRhvtkRFVntt0_Z3x3OBePH1dQXufIbflj6Xi2FkGhggxRj-UlHzJBAnFKJnivPQWhfhxBVNX_2ubXbiv-8ZumpwdP8MnIsTJj5G-8S2oixtLkwUrHn4AisInAFdo0evjFwUw4gNNvXazPsOi9uGTJF1r2Ft_dJ12_U7q8b-yo1s246OAatYNLh7rvb-0vOYIKihWdZoChogfvfk0qSecwZeFAqAzgzEAoyLdMt0U2oJZgA";

const Chat = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<Map<string, number>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const locationName = locationId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const locationThemes = {
    floresta: {
      bgImage: forestBg,
      overlay: 'bg-black/50',
      header: 'bg-[#102213]/80 border-b-[#92c99b]/20',
      nameColor: 'text-[#92c99b]',
      otherBubble: 'bg-[#234829] text-white',
      inputContainer: 'bg-[#102213]/80 border-t-[#92c99b]/20',
      inputForm: 'bg-[#0A1A0C] border-[#92c99b]/20',
    },
    default: {
      bgImage: heroImage,
      overlay: 'bg-background/90',
      header: 'bg-background/80 border-b-border',
      nameColor: 'text-secondary',
      otherBubble: 'bg-muted text-foreground',
      inputContainer: 'bg-background/80 border-t-border',
      inputForm: 'bg-muted/50 border-border',
    }
  };

  const theme = locationId === 'floresta' ? locationThemes.floresta : locationThemes.default;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    if (!locationId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*, users(name, photo_url, element)')
      .eq('location_name', locationId)
      .order('created_at', { ascending: true });

    if (error) toast.error('Erro ao carregar mensagens.');
    else setMessages(data as any[] || []);
    setLoading(false);
  }, [locationId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  useEffect(() => {
    if (!locationId || !user) return;

    const channel = supabase.channel(`chat-realtime:${locationId}`, { config: { broadcast: { self: false } } });
    channelRef.current = channel;

    const handleNewMessage = async (payload: any) => {
      const { data: userData } = await supabase.from('users').select('name, photo_url, element').eq('id', payload.new.user_id).single();
      setMessages(current => [...current, { ...payload.new, users: userData }]);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !locationId) return;
    const content = newMessage.trim();
    setNewMessage('');
    const { error } = await supabase.from('messages').insert({ content, user_id: user.id, location_name: locationId });
    if (error) {
      toast.error('Erro ao enviar mensagem.');
      setNewMessage(content);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (channelRef.current && user) {
      channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { name: user.name, id: user.id } });
    }
  };

  const getElementEmoji = (element: string | null) => ({ água: "🌊", fogo: "🔥", terra: "🌱", ar: "💨" }[element || ''] || "?");
  const getLocationIcon = () => {
    if (locationId?.includes('floresta')) return <Trees className="w-6 h-6" />;
    if (locationId?.includes('sala')) return <BookOpen className="w-6 h-6" />;
    if (locationId?.includes('dormitorio')) return <Home className="w-6 h-6" />;
    return <Trees className="w-6 h-6" />;
  };

  const renderMessages = () => {
    const messageElements: JSX.Element[] = [];
    let lastDate: Date | null = null;

    messages.forEach((msg, index) => {
      const currentDate = new Date(msg.created_at);
      if (!lastDate || !isSameDay(currentDate, lastDate)) {
        messageElements.push(<DateSeparator key={`date-${msg.id}`} date={currentDate} />);
      }
      lastDate = currentDate;

      const prevMsg = messages[index - 1];
      const isFirstInGroup = !prevMsg || prevMsg.user_id !== msg.user_id || !isSameDay(new Date(prevMsg.created_at), currentDate);

      messageElements.push(
        <ChatMessage
          key={msg.id}
          message={msg}
          isOwnMessage={msg.user_id === user?.id}
          isFirstInGroup={isFirstInGroup}
          theme={theme}
        />
      );
    });
    return messageElements;
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-background">
      <div className="absolute inset-0 z-0">
        <img src={theme.bgImage} alt="Cenário do chat" className="h-full w-full object-cover" />
        <div className={cn("absolute inset-0", theme.overlay)} />
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-lg mx-auto w-full">
        <header className={cn("flex items-center backdrop-blur-sm p-4 pb-2 justify-between shrink-0 border-b", theme.header)}>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/locais')} className="h-10 w-10 text-white"><ArrowLeft className="w-5 h-5" /></Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-full bg-black/20">{getLocationIcon()}</div>
              <h2 className="text-white text-lg font-bold font-heading tracking-wide">{locationName}</h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-white"><MoreVertical className="w-5 h-5" /></Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? <p className="text-center text-muted-foreground m-auto">Carregando chat...</p> : renderMessages()}
          <div className="h-6 text-sm text-white/70 italic text-center">
            {typingUsers.length > 0 && `${typingUsers.map(u => u.name).join(', ')} está digitando...`}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <div className={cn("backdrop-blur-sm p-4 pt-2 border-t shrink-0", theme.inputContainer)}>
          <form onSubmit={handleSendMessage} className={cn("flex items-center gap-2 border rounded-full px-2 py-1.5", theme.inputForm)}>
            <Button type="button" variant="ghost" size="icon" className="text-[#13ec37] hover:bg-primary/20 rounded-full shrink-0"><PlusCircle className="w-5 h-5" /></Button>
            <Input value={newMessage} onChange={handleInputChange} placeholder="Digite sua runa..." className="flex-1 bg-transparent text-white border-none focus:ring-0 p-2 text-base placeholder:text-white/60" />
            <Button type="submit" size="icon" className="bg-[#13ec37] text-[#102213] rounded-full shrink-0 w-10 h-10 hover:bg-primary/90"><Send className="w-5 h-5" /></Button>
          </form>
        </div>
      </div>
    </div>
  );
};

const DateSeparator = ({ date }: { date: Date }) => {
  const formatDate = () => {
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };
  return (
    <div className="flex items-center justify-center my-4">
      <span className="px-3 py-1 text-xs font-bold text-white/80 bg-black/30 rounded-full">{formatDate()}</span>
    </div>
  );
};

const ChatMessage = ({ message, isOwnMessage, isFirstInGroup, theme }: { message: Message; isOwnMessage: boolean; isFirstInGroup: boolean; theme: any }) => {
  const getElementEmoji = (element: string | null) => ({ água: "🌊", fogo: "🔥", terra: "🌱", ar: "💨" }[element || ''] || "?");
  
  return (
    <div className={cn('flex items-end gap-3', isOwnMessage ? 'justify-end' : '', isFirstInGroup && 'mt-4')}>
      {!isOwnMessage && (
        <Avatar className={cn('w-10 h-10 shrink-0 self-start', !isFirstInGroup && 'opacity-0')}>
          <AvatarImage src={message.users.photo_url || undefined} />
          <AvatarFallback>{getElementEmoji(message.users.element)}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex flex-col gap-1', isOwnMessage ? 'items-end' : 'items-start')}>
        {isFirstInGroup && (
          <p className={cn("text-[13px] font-bold font-heading", isOwnMessage ? 'text-[#13ec37]' : theme.nameColor)}>
            {message.users.name}
          </p>
        )}
        <div className={cn("flex items-end gap-2 text-base leading-normal rounded-lg px-4 py-3 max-w-xs md:max-w-sm break-words", 
          isOwnMessage ? 'rounded-br-none bg-[#13ec37] text-[#102213]' : `rounded-bl-none ${theme.otherBubble}`
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
          <span className="text-[10px] opacity-70 mt-1 shrink-0">{format(new Date(message.created_at), 'HH:mm')}</span>
        </div>
      </div>
      {isOwnMessage && (
        <Avatar className={cn('w-10 h-10 shrink-0 self-start', !isFirstInGroup && 'opacity-0')}>
          <AvatarImage src={message.users.photo_url || undefined} />
          <AvatarFallback>{getElementEmoji(message.users.element)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default Chat;