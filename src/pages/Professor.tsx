import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Trophy, LogOut, Sparkles, Edit, Map } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";

const Professor = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useUser();
  const [locationPassword, setLocationPassword] = useState("");
  const [isLocationAlertOpen, setIsLocationAlertOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture || null);

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.profilePicture);
      
      // Escutar mudanças no perfil do usuário
      const channel = supabase
        .channel(`public:users:id=eq.${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
          (payload) => {
            console.log('User data changed!', payload);
            // Atualizar os dados do usuário quando houver mudanças
            refreshUser();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, refreshUser]);

  // Atualizar a URL da imagem quando o usuário mudar
  useEffect(() => {
    if (user) {
      setAvatarUrl(user.profilePicture);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Até breve, Professor!");
  };

  const handleLocationAccess = () => {
    if (locationPassword === "88620787") {
      sessionStorage.setItem('isLocationAuthenticated', 'true');
      navigate('/locais');
      toast.success("Acesso concedido.");
    } else {
      toast.error("Senha incorreta.");
    }
    setIsLocationAlertOpen(false);
    setLocationPassword("");
  };

  const getElementEmoji = (element: string | null) => {
    if (!element) return "?";
    const emojis: Record<string, string> = { água: "🌊", fogo: "🔥", terra: "🌱", ar: "💨" };
    return emojis[element] || "?";
  };

  // Adicionar timestamp para forçar atualização do cache
  const getAvatarUrlWithTimestamp = () => {
    if (!avatarUrl) return undefined;
    // Adicionar timestamp apenas se for uma URL do Supabase
    if (avatarUrl.includes('supabase')) {
      const separator = avatarUrl.includes('?') ? '&' : '?';
      return `${avatarUrl}${separator}t=${Date.now()}`;
    }
    return avatarUrl;
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarImage 
                src={getAvatarUrlWithTimestamp()} 
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-2xl font-heading">
                {getElementEmoji(user?.element || null)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-heading text-4xl font-bold text-gradient-arcane mb-2">Painel do Professor</h1>
              <p className="text-muted-foreground">Bem-vindo, {user?.name || 'Professor'}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-8 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group" onClick={() => navigate("/professor/atividades")}>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-arcane rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold">Atividades</h3>
              <p className="text-sm text-muted-foreground">Criar e gerenciar atividades</p>
            </div>
          </Card>
          <Card className="p-8 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group" onClick={() => navigate("/professor/missoes")}>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-10 h-10 text-secondary-foreground" />
              </div>
              <h3 className="font-heading text-2xl font-bold">Missões</h3>
              <p className="text-sm text-muted-foreground">Criar e gerenciar missões</p>
            </div>
          </Card>
          <Card className="p-8 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group" onClick={() => navigate("/professor/xp")}>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-destructive to-destructive/70 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold">XP</h3>
              <p className="text-sm text-muted-foreground">Distribuir pontos de experiência</p>
            </div>
          </Card>
          <Card className="p-8 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group" onClick={() => navigate("/professor/poderes")}>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold">Poderes</h3>
              <p className="text-sm text-muted-foreground">Consultar guias de elementos</p>
            </div>
          </Card>
          <AlertDialog open={isLocationAlertOpen} onOpenChange={setIsLocationAlertOpen}>
            <AlertDialogTrigger asChild>
              <Card className="p-8 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Map className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold">Locais</h3>
                  <p className="text-sm text-muted-foreground">Converse com os alunos</p>
                </div>
              </Card>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Acesso Restrito</AlertDialogTitle>
                <AlertDialogDescription>Insira a senha para acessar os locais da academia.</AlertDialogDescription>
              </AlertDialogHeader>
              <Input 
                type="password" 
                placeholder="********" 
                value={locationPassword} 
                onChange={(e) => setLocationPassword(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleLocationAccess()} 
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleLocationAccess}>Entrar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Card className="p-8 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group" onClick={() => navigate("/professor/perfil")}>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Edit className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold">Editar Perfil</h3>
              <p className="text-sm text-muted-foreground">Mudar foto e elemento</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Professor;