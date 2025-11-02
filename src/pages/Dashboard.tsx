import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Zap, Target, Trophy, LogOut, Camera, Map, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading, refreshUser } = useUser();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [locationPassword, setLocationPassword] = useState("");
  const [isLocationAlertOpen, setIsLocationAlertOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.profilePicture);
      const channel = supabase
        .channel(`public:users:id=eq.${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
          (payload) => {
            console.log('User data changed!', payload);
            toast.info("Seu perfil foi atualizado!");
            refreshUser();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        if (tempAvatarUrl) {
          URL.revokeObjectURL(tempAvatarUrl);
        }
      };
    }
  }, [user, refreshUser, tempAvatarUrl]);

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Até breve!");
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter menos de 5MB.");
      return;
    }

    setUploading(true);
    const tempUrl = URL.createObjectURL(file);
    setTempAvatarUrl(tempUrl);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const urlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(urlWithTimestamp);
      
      toast.success("Foto carregada com sucesso! Clique em salvar para confirmar.");
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error(`Erro ao enviar a foto: ${error.message || "Tente novamente"}`);
      setTempAvatarUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSaveNewAvatar = async () => {
    if (!avatarUrl || !user) return;

    try {
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ photo_url: avatarUrl.split('?')[0] })
        .eq('id', user.id);

      if (updateUserError) throw updateUserError;
      
      await refreshUser();
      setTempAvatarUrl(null);
      toast.success("Foto de perfil atualizada!");
      
      if (tempAvatarUrl) {
        URL.revokeObjectURL(tempAvatarUrl);
      }
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error(`Erro ao atualizar o perfil: ${error.message || "Tente novamente"}`);
    }
  };

  const handleCancelNewAvatar = () => {
    setAvatarUrl(user?.profilePicture || null);
    setTempAvatarUrl(null);
    
    if (tempAvatarUrl) {
      URL.revokeObjectURL(tempAvatarUrl);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const getElementEmoji = (element: string) => ({ água: "🌊", fogo: "🔥", terra: "🌱", ar: "💨" }[element] || "");
  const getElementGradient = (element: string) => ({ água: "bg-gradient-water", fogo: "bg-gradient-fire", terra: "bg-gradient-earth", ar: "bg-gradient-air" }[element] || "");

  if (loading || !user) return null;

  const displayAvatarUrl = tempAvatarUrl || avatarUrl || user.profilePicture;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-heading text-4xl font-bold text-gradient-arcane mb-2">Academia Arcana de Alvorada</h1>
            <p className="text-muted-foreground">Bem-vindo de volta, {user.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2"><LogOut className="w-4 h-4" /> Sair</Button>
        </div>

        <Card className="p-6 shadow-card border-2 border-primary/20">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-primary shadow-glow">
                <AvatarImage key={displayAvatarUrl} src={displayAvatarUrl || undefined} className="object-cover" />
                <AvatarFallback className={`${getElementGradient(user.element || '')} text-white text-2xl font-heading`}>{user.element ? getElementEmoji(user.element) : '?'}</AvatarFallback>
              </Avatar>
              {tempAvatarUrl ? (
                <div className="absolute -bottom-2 -right-2 flex gap-1 bg-background rounded-full p-1">
                  <Button onClick={handleSaveNewAvatar} className="bg-green-600 text-white rounded-full p-2 cursor-pointer hover:bg-green-700 transition-colors shadow-lg h-10 w-10" title="Salvar" disabled={uploading}><Save className="w-4 h-4" /></Button>
                  <Button onClick={handleCancelNewAvatar} className="bg-destructive text-white rounded-full p-2 cursor-pointer hover:bg-destructive/80 transition-colors shadow-lg h-10 w-10" title="Cancelar" disabled={uploading}><X className="w-4 h-4" /></Button>
                </div>
              ) : (
                <label htmlFor="profile-picture" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:opacity-90 transition-opacity shadow-lg"><Camera className="w-4 h-4" /></label>
              )}
              <input ref={fileInputRef} id="profile-picture" type="file" accept="image/*" className="hidden" onChange={handleProfilePictureUpload} disabled={uploading} />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-2xl font-bold mb-1">{user.name}</h2>
              <p className="text-muted-foreground mb-3">@{user.username}</p>
              <div className="flex gap-4 text-sm">
                <div className={`px-4 py-2 rounded-lg ${getElementGradient(user.element || '')} text-white font-heading`}>{user.element ? `${getElementEmoji(user.element)} ${user.element.charAt(0).toUpperCase() + user.element.slice(1)}` : 'Sem Elemento'}</div>
                <div className="px-4 py-2 rounded-lg bg-gradient-arcane text-white font-heading">Rank {user.rank}</div>
                <div className="px-4 py-2 rounded-lg border-2 border-secondary bg-card font-heading"><Trophy className="w-4 h-4 inline mr-1 text-secondary" />{user.xp} XP</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group" onClick={() => navigate("/aulas")}>
            <div className="text-center space-y-3"><div className="w-16 h-16 mx-auto bg-gradient-arcane rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><BookOpen className="w-8 h-8 text-white" /></div><h3 className="font-heading text-xl font-bold">Aulas</h3><p className="text-sm text-muted-foreground">Estude e aprenda</p></div>
          </Card>
          <Card className="p-6 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group" onClick={() => navigate("/poderes")}>
            <div className={`w-16 h-16 mx-auto ${getElementGradient(user.element || '')} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}><Zap className="w-8 h-8 text-white" /></div><div className="text-center space-y-1 mt-3"><h3 className="font-heading text-xl font-bold">Poderes</h3><p className="text-sm text-muted-foreground">Seu elemento</p></div>
          </Card>
          <AlertDialog open={isLocationAlertOpen} onOpenChange={setIsLocationAlertOpen}>
            <AlertDialogTrigger asChild>
              <Card className="p-6 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group">
                <div className="text-center space-y-3"><div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Map className="w-8 h-8 text-white" /></div><h3 className="font-heading text-xl font-bold">Locais</h3><p className="text-sm text-muted-foreground">Converse com amigos</p></div>
              </Card>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Acesso Restrito</AlertDialogTitle><AlertDialogDescription>Insira a senha para acessar os locais da academia.</AlertDialogDescription></AlertDialogHeader>
              <Input type="password" placeholder="********" value={locationPassword} onChange={(e) => setLocationPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLocationAccess()} />
              <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleLocationAccess}>Entrar</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Card className="p-6 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group" onClick={() => navigate("/missoes")}>
            <div className="text-center space-y-3"><div className="w-16 h-16 mx-auto bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Target className="w-8 h-8 text-secondary-foreground" /></div><h3 className="font-heading text-xl font-bold">Missões</h3><p className="text-sm text-muted-foreground">Complete tarefas</p></div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;