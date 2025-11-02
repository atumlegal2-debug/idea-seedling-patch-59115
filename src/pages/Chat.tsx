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
      iconContainer: 'bg-[#234829]',
      iconColor: 'text-[#92c99b]',
      nameColor: 'text-[#92c99b]',
      otherBubble: 'bg-[#234829] text-white',
      inputContainer: 'bg-[#102213]/80 border-t-[#92c99b]/20',
      inputForm: 'bg-[#0A1A0C] border-[#92c99b]/20',
      inputPlaceholder: 'placeholder:text-[#92c99b]/60',
    },
    default: {
      bgImage: heroImage,
      overlay: 'bg-background/90',
      header: 'bg-background/80 border-b-border',
      iconContainer: 'bg-muted',
      iconColor: 'text-primary',
      nameColor: 'text-secondary',
      otherBubble: 'bg-muted text-foreground',
      inputContainer: 'bg-background/80 border-t-border',
      inputForm: 'bg-muted/50 border-border',
      inputPlaceholder: 'placeholder:text-muted-foreground',
    }
  };

  const getTheme = () => {
    if (locationId?.startsWith('sala')) return locationThemes.default;
    switch (locationId) {
      case 'floresta': return locationThemes.floresta;
      default: return locationThemes.default;
    }
  };

  const theme = getTheme();

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

    if (error) {
      toast.error('Erro ao carregar mensagens.');
    } else {
      setMessages(data as any[] || []);
    }
    setLoading(false);
  }, [locationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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

  return (
    <div className="relative h-screen w-full flex flex-col bg-background">
      <div className="absolute inset-0 z-0">
        <img src={theme.bgImage} alt="Cenário do chat" className="h-full w-full object-cover opacity-20" />
        <div className={cn("absolute inset-0", theme.overlay)} />
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-lg mx-auto w-full">
        <header className={cn("flex items-center backdrop-blur-sm p-4 pb-2 justify-between shrink-0 border-b", theme.header)}>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/locais')} className="h-10 w-10 text-white"><ArrowLeft className="w-5 h-5" /></Button>
            <div className="flex items-center gap-3">
              <div className={cn("flex items-center justify-center size-10 rounded-full", theme.iconContainer, theme.iconColor)}>{getLocationIcon()}</div>
              <h2 className="text-white text-lg font-bold font-heading tracking-wide">{locationName}</h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-white"><MoreVertical className="w-5 h-5" /></Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? <p className="text-center text-muted-foreground m-auto">Carregando chat...</p>
            : messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-3 ${msg.user_id === user?.id ? 'justify-end' : ''}`}>
                {msg.user_id !== user?.id && <Avatar className="w-10 h-10 shrink-0 self-start"><AvatarImage src={msg.users.photo_url || undefined} /><AvatarFallback>{getElementEmoji(msg.users.element)}</AvatarFallback></Avatar>}
                <div className={`flex flex-col gap-1 ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                  <p className={cn("text-[13px] font-bold font-heading", theme.nameColor)}>{msg.users.name}</p>
                  <p className={cn("text-base leading-normal rounded-lg px-4 py-3 max-w-xs md:max-w-sm break-words", msg.user_id === user?.id ? 'rounded-br-none bg-[#13ec37] text-[#102213]' : `rounded-bl-none ${theme.otherBubble}`)}>
                    {msg.content}
                  </p>
                </div>
                {msg.user_id === user?.id && <Avatar className="w-10 h-10 shrink-0 self-start"><AvatarImage src={user?.profilePicture || undefined} /><AvatarFallback>{getElementEmoji(user?.element)}</AvatarFallback></Avatar>}
              </div>
            ))
          }
          <div className="h-6 text-sm text-muted-foreground italic text-center">
            {typingUsers.length > 0 && `${typingUsers.map(u => u.name).join(', ')} ${typingUsers.length > 1 ? 'está' : 'está'} digitando...`}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <div className={cn("backdrop-blur-sm p-4 pt-2 border-t shrink-0", theme.inputContainer)}>
          <form onSubmit={handleSendMessage} className={cn("flex items-center gap-2 border rounded-full px-2 py-1.5", theme.inputForm)}>
            <Button type="button" variant="ghost" size="icon" className="text-[#13ec37] hover:bg-primary/20 rounded-full shrink-0"><PlusCircle className="w-5 h-5" /></Button>
            <Input value={newMessage} onChange={handleInputChange} placeholder="Digite sua runa..." className={cn("flex-1 bg-transparent text-white border-none focus:ring-0 p-2 text-base", theme.inputPlaceholder)} />
            <Button type="submit" size="icon" className="bg-[#13ec37] text-[#102213] rounded-full shrink-0 w-10 h-10 hover:bg-primary/90"><Send className="w-5 h-5" /></Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;