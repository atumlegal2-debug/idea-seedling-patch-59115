import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Park, BookOpen, Home } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import heroImage from "@/assets/academy-hero-enhanced.jpg";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const locationName = locationId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    if (!locationId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*, users(name, photo_url, element)')
      .eq('location_name', locationId)
      .order('created_at', { ascending: true });

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
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!locationId) return;

    const channel = supabase
      .channel(`public:messages:location_name=eq.${locationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `location_name=eq.${locationId}` },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [locationId, fetchMessages]);

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
    if (locationId?.includes('floresta')) return <Park className="w-6 h-6 text-green-400" />;
    if (locationId?.includes('sala')) return <BookOpen className="w-6 h-6 text-primary" />;
    if (locationId?.includes('dormitorio')) return <Home className="w-6 h-6 text-secondary" />;
    return <Park className="w-6 h-6 text-muted-foreground" />;
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-background">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Academia Arcana" className="h-full w-full object-cover opacity-10" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full max-w-2xl mx-auto w-full">
        {/* Header */}
        <header className="flex items-center bg-background/80 backdrop-blur-sm p-4 pb-3 justify-between shrink-0 border-b border-border">
          <div className="flex items-center gap-3">
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
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
                    <Avatar className="w-10 h-10 shrink-0 border-2 border-primary/50">
                      <AvatarImage src={msg.users.photo_url || undefined} />
                      <AvatarFallback>{getElementEmoji(msg.users.element)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1 items-start max-w-md">
                      <p className="text-secondary text-sm font-bold font-heading ml-3">{msg.users.name}</p>
                      <div className="text-base font-normal leading-normal flex rounded-2xl rounded-bl-none px-4 py-3 bg-muted text-foreground">
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
                      <div className="text-base font-normal leading-normal flex rounded-2xl rounded-br-none px-4 py-3 bg-gradient-arcane text-white">
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                       <p className="text-xs text-muted-foreground mt-1 mr-3">
                        {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Avatar className="w-10 h-10 shrink-0 border-2 border-secondary">
                      <AvatarImage src={user?.profilePicture || undefined} />
                      <AvatarFallback>{getElementEmoji(user?.element)}</AvatarFallback>
                    </Avatar>
                  </>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-background/80 backdrop-blur-sm p-4 pt-2 border-t border-border shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-muted/50 border border-border rounded-full px-2 py-1.5">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
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