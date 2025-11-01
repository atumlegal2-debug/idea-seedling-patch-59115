import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Camera, Save } from 'lucide-react';
import { toast } from 'sonner';
import waterIcon from "@/assets/water-element.png";
import fireIcon from "@/assets/fire-element.png";
import earthIcon from "@/assets/earth-element.png";
import airIcon from "@/assets/air-element.png";

const ProfessorEditProfile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  
  const [element, setElement] = useState(user?.element || null);
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture || null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.isProfessor) {
      navigate('/');
    }
    setElement(user?.element || null);
    setAvatarUrl(user?.profilePicture || null);
  }, [user, navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

    if (uploadError) {
      toast.error("Erro ao enviar a foto.");
      console.error(uploadError);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
    toast.info("Foto carregada. Clique em salvar para confirmar.");
  };

  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({
        element: element,
        photo_url: avatarUrl,
      })
      .eq('id', user.id);

    if (error) {
      toast.error("Erro ao salvar o perfil.");
      console.error(error);
    } else {
      await refreshUser();
      toast.success("Perfil atualizado com sucesso!");
      navigate('/professor');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/professor')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>

        <Card className="p-8 shadow-card border-2 border-primary/30">
          <h1 className="font-heading text-3xl font-bold mb-6 text-gradient-arcane">Editar Perfil</h1>
          
          <div className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-primary shadow-glow">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-4xl font-heading bg-muted">?</AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="profile-picture" 
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-3 cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                </label>
                <input 
                  id="profile-picture" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </div>
              {uploading && <p className="text-sm text-muted-foreground">Enviando...</p>}
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-heading">Escolha seu Elemento</Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "água", icon: waterIcon, gradient: "bg-gradient-water" },
                  { name: "fogo", icon: fireIcon, gradient: "bg-gradient-fire" },
                  { name: "terra", icon: earthIcon, gradient: "bg-gradient-earth" },
                  { name: "ar", icon: airIcon, gradient: "bg-gradient-air" }
                ].map((el) => (
                  <button
                    key={el.name}
                    onClick={() => setElement(el.name as any)}
                    className={`relative p-6 rounded-xl border-2 transition-all overflow-hidden group ${
                      element === el.name 
                        ? "border-primary shadow-glow scale-105" 
                        : "border-border bg-card/50 hover:border-primary/50 hover:scale-102"
                    }`}
                  >
                    <div className={`absolute inset-0 ${el.gradient} opacity-0 group-hover:opacity-20 transition-opacity ${element === el.name ? 'opacity-30' : ''}`} />
                    <div className="relative">
                      <img src={el.icon} alt={el.name} className="w-16 h-16 mx-auto mb-2 drop-shadow-lg" />
                      <div className="text-sm font-heading capitalize">{el.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-gradient-arcane hover:opacity-90 shadow-glow text-lg py-6 gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar Perfil
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfessorEditProfile;