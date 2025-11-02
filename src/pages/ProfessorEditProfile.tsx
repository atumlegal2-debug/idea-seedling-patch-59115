import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Camera, Save, X } from 'lucide-react';
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
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter menos de 5MB.");
      return;
    }

    setUploading(true);
    
    // Create a temporary URL for preview
    const tempUrl = URL.createObjectURL(file);
    setTempAvatarUrl(tempUrl);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;

    try {
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL with timestamp to avoid caching
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const urlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(urlWithTimestamp);
      
      toast.success("Foto carregada com sucesso! Clique em salvar para confirmar.");
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error(`Erro ao enviar a foto: ${error.message || "Tente novamente"}`);
      setTempAvatarUrl(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          element: element,
          photo_url: avatarUrl.split('?')[0] // Remove timestamp for storage
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshUser();
      setTempAvatarUrl(null);
      toast.success("Perfil atualizado com sucesso!");
      navigate('/professor');
      
      // Clean up temporary URL
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
    
    // Clean up temporary URL
    if (tempAvatarUrl) {
      URL.revokeObjectURL(tempAvatarUrl);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine which avatar to show
  const displayAvatarUrl = tempAvatarUrl || avatarUrl;

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
                  <AvatarImage 
                    key={displayAvatarUrl} 
                    src={displayAvatarUrl || undefined} 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl font-heading bg-muted">?</AvatarFallback>
                </Avatar>
                
                {/* Show Save/Cancel buttons when there's a new avatar to save */}
                {tempAvatarUrl ? (
                  <div className="absolute -bottom-2 -right-2 flex gap-1 bg-background rounded-full p-1">
                    <Button
                      onClick={handleSave}
                      className="bg-green-600 text-white rounded-full p-2 cursor-pointer hover:bg-green-700 transition-colors shadow-lg h-10 w-10"
                      title="Salvar"
                      disabled={uploading}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleCancelNewAvatar}
                      className="bg-destructive text-white rounded-full p-2 cursor-pointer hover:bg-destructive/80 transition-colors shadow-lg h-10 w-10"
                      title="Cancelar"
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label 
                    htmlFor="profile-picture" 
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-3 cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                  >
                    <Camera className="w-5 h-5" />
                  </label>
                )}
                
                <input 
                  ref={fileInputRef}
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
              disabled={uploading}
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