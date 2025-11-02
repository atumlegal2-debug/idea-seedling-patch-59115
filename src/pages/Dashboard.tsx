import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Zap, Target, Trophy, LogOut, Camera, Map, Save } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading, refreshUser } = useUser();
  const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
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
      };
    }
  }, [user, refreshUser]);

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Até breve!");
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Erro ao enviar a foto.");
      console.error(uploadError);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = `${data.publicUrl}?t=${new Date().getTime()}`;
    
    setNewAvatarUrl(publicUrl);
    setIsUploading(false);
  };

  const handleSaveNewAvatar = async () => {
    if (!newAvatarUrl || !user) return;

    const { error: updateUserError } = await supabase
      .from('users')
      .update({ photo_url: newAvatarUrl })
      .eq('id', user.id);

    if (updateUserError) {
      toast.error("Erro ao atualizar o perfil.");
    } else {
      await refreshUser();
      setNewAvatarUrl(null);
      toast.success("Foto de perfil atualizada!");
    }
  };

  const getElementEmoji = (element: string) => {
    const emojis: Record<string, string> = {
      água: "🌊",
      fogo: "🔥",
      terra: "🌱",
      ar: "💨"
    };
    return emojis[element] || "";
  };

  const getElementGradient = (element: string) => {
    const gradients: Record<string, string> = {
      água: "bg-gradient-water",
      fogo: "bg-gradient-fire",
      terra: "bg-gradient-earth",
      ar: "bg-gradient-air"
    };
    return gradients[element] || "";
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-heading text-4xl font-bold text-gradient-arcane mb-2">
              Academia Arcana de Alvorada
            </h1>
            <p className="text-muted-foreground">Bem-vindo de volta, {user.name}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        <Card className="p-6 shadow-card border-2 border-primary/20">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-primary shadow-glow">
                <AvatarImage src={newAvatarUrl || user.profilePicture || undefined} />
                <AvatarFallback className={`${getElementGradient(user.element || '')} text-white text-2xl font-heading`}>
                  {user.element ? getElementEmoji(user.element) : '?'}
                </AvatarFallback>
              </Avatar>
              {newAvatarUrl ? (
                <button
                  onClick={handleSaveNewAvatar}
                  className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 cursor-pointer hover:bg-green-700 transition-colors shadow-lg"
                >
                  <Save className="w-4 h-4" />
                </button>
              ) : (
                <label 
                  htmlFor="profile-picture" 
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </label>
              )}
              <input 
                id="profile-picture" 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={handleProfilePictureUpload}
                disabled={isUploading}
              />
            </div>
            
            <div className="flex-1">
              <h2 className="font-heading text-2xl font-bold mb-1">{user.name}</h2>
              <p className="text-muted-foreground mb-3">@{user.username}</p>
              <div className="flex gap-4 text-sm">
                <div className={`px-4 py-2 rounded-lg ${getElementGradient(user.element || '')} text-white font-heading`}>
                  {user.element ? `${getElementEmoji(user.element)} ${user.element.charAt(0).toUpperCase() + user.element.slice(1)}` : 'Sem Elemento'}
                </div>
                <div className="px-4 py-2 rounded-lg bg-gradient-arcane text-white font-heading">
                  Rank {user.rank}
                </div>
                <div className="px-4 py-2 rounded-lg border-2 border-secondary bg-card font-heading">
                  <Trophy className="w-4 h-4 inline mr-1 text-secondary" />
                  {user.xp} XP
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className="p-6 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group"
            onClick={() => navigate("/aulas")}
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-gradient-arcane rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-xl font-bold">Aulas</h3>
              <p className="text-sm text-muted-foreground">Estude e aprenda</p>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group"
            onClick={() => navigate("/poderes")}
          >
            <div className={`w-16 h-16 mx-auto ${getElementGradient(user.element || '')} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-xl font-bold">Poderes</h3>
              <p className="text-sm text-muted-foreground">Seu elemento</p>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group"
            onClick={() => navigate("/locais")}
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Map className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-xl font-bold">Locais</h3>
              <p className="text-sm text-muted-foreground">Converse com amigos</p>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group"
            onClick={() => navigate("/missoes")}
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="font-heading text-xl font-bold">Missões</h3>
              <p className="text-sm text-muted-foreground">Complete tarefas</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;