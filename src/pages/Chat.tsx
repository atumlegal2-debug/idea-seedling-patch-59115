import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    name: string;
    photo_url: string | null;
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
      .select('*, users(name, photo_url)')
      .eq('location_name', locationId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar mensagens.');
      console.error(error);
    } else {
      setMessages(data as Message[]);
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
      setNewMessage(content); // Restore message on error
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex flex-col flex-1">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => navigate('/locais')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold text-gradient-arcane">{locationName}</h1>
          </div>
        </div>

        <Card className="flex-1 flex flex-col p-4 md:p-6 border-2 border-primary/20 bg-card/80 backdrop-blur">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Carregando chat...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-muted-foreground">Seja o primeiro a enviar uma mensagem!</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 items-start ${msg.user_id === user?.id ? 'justify-end' : ''}`}>
                  {msg.user_id !== user?.id && (
                    <Avatar className="w-10 h-10 border-2 border-primary/50">
                      <AvatarImage src={msg.users.photo_url || undefined} />
                      <AvatarFallback>{msg.users.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-xs md:max-w-md ${msg.user_id === user?.id ? 'text-right' : ''}`}>
                    <p className={`text-xs text-muted-foreground mb-1 ${msg.user_id === user?.id ? 'mr-2' : 'ml-2'}`}>
                      {msg.users.name}
                    </p>
                    <div className={`px-4 py-2 rounded-2xl ${msg.user_id === user?.id ? 'bg-gradient-arcane text-white rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${msg.user_id === user?.id ? 'mr-2' : 'ml-2'}`}>
                      {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  {msg.user_id === user?.id && (
                    <Avatar className="w-10 h-10 border-2 border-secondary">
                      <AvatarImage src={msg.users.photo_url || undefined} />
                      <AvatarFallback>{msg.users.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 pt-4 border-t border-border">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="text-base"
            />
            <Button type="submit" size="icon" className="bg-gradient-arcane hover:opacity-90 shadow-glow flex-shrink-0">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Chat;