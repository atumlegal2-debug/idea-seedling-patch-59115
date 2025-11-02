import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, LogOut, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ManagedUser {
  id: string;
  name: string;
  username: string;
  element: "água" | "terra" | "fogo" | "ar" | null;
  photo_url: string | null;
  is_professor: boolean;
  updated_at: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdminAuthenticated');
    if (isAdmin !== 'true') {
      navigate('/');
    } else {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('is_professor', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar usuários.');
      console.error(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      toast.error(`Erro ao deletar ${username}.`);
      console.error(error);
    } else {
      toast.success(`${username} foi deletado com sucesso.`);
      fetchUsers(); // Refresh the list
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    navigate('/');
  };

  const getElementEmoji = (element: string | null) => {
    if (!element) return "?";
    const emojis: Record<string, string> = { água: "🌊", fogo: "🔥", terra: "🌱", ar: "💨" };
    return emojis[element] || "?";
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando usuários...</div>;
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-heading text-4xl font-bold text-gradient-arcane">Painel Secreto</h1>
            <p className="text-muted-foreground mt-1">Gerenciamento de todos os usuários</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="p-4 border-2 border-border/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-primary">
                    <AvatarImage src={user.photo_url ? `${user.photo_url}?t=${new Date(user.updated_at).getTime()}` : undefined} />
                    <AvatarFallback className="bg-muted">{getElementEmoji(user.element)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold font-heading">{user.name}</p>
                    <p className="text-sm text-muted-foreground">@{user.username.replace(/\d{4}$/, '')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {user.is_professor ? (
                    <div className="flex items-center gap-2 text-secondary font-bold text-sm">
                      <ShieldCheck className="w-5 h-5" />
                      <span>Professor</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <User className="w-5 h-5" />
                      <span>Aluno</span>
                    </div>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso irá deletar permanentemente a conta de 
                          <span className="font-bold"> @{user.username}</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(user.id, user.username)}>
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;