import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import heroImage from "@/assets/academy-hero-enhanced.jpg";
import waterIcon from "@/assets/water-element.png";
import fireIcon from "@/assets/fire-element.png";
import earthIcon from "@/assets/earth-element.png";
import airIcon from "@/assets/air-element.png";
import { useUser, AppUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import VirtualKeyboard from "@/components/VirtualKeyboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
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

interface SavedProfile {
  username: string;
  name: string;
  profilePicture: string | null;
  isProfessor: boolean;
  element: "água" | "terra" | "fogo" | "ar" | null;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, login, loading, removeProfile } = useUser();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  
  const [loginUsername, setLoginUsername] = useState("");
  const [saveProfile, setSaveProfile] = useState(true);
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [element, setElement] = useState<"água" | "terra" | "fogo" | "ar" | "">("");
  
  const [adminPassword, setAdminPassword] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    const profiles: SavedProfile[] = JSON.parse(localStorage.getItem("savedProfiles") || "[]");
    setSavedProfiles(profiles);
    if (profiles.length === 0) {
      setShowLoginForm(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate(user.isProfessor ? "/professor" : "/dashboard");
    }
  }, [user, navigate]);

  const performLogin = async (usernameToLogin: string) => {
    if (!usernameToLogin.trim()) {
      toast.error("Por favor, insira seu nome de usuário");
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', usernameToLogin)
      .single();

    if (error || !data) {
      toast.error("Usuário não encontrado ou senha incorreta.");
      return;
    }
    
    const appUser: AppUser = { ...data, isProfessor: data.is_professor, profilePicture: data.photo_url, updated_at: data.updated_at };
    login(appUser, saveProfile);
    navigate(appUser.isProfessor ? "/professor" : "/dashboard");
  };

  const handleCreateAccount = async () => {
    if (!name.trim() || !username.trim() || !element) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const usernameRegex = /^[a-zA-Z]+\d{4}$/;
    if (!usernameRegex.test(username)) {
      toast.error("Nome de usuário deve ser um nome seguido de 4 dígitos (ex: Ana1313)");
      return;
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      toast.error("Nome de usuário já existe");
      return;
    }

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ name, username, element, is_professor: false })
      .select()
      .single();

    if (error || !newUser) {
      toast.error("Erro ao criar conta.");
      console.error(error);
      return;
    }
    
    const appUser: AppUser = { ...newUser, isProfessor: false, profilePicture: newUser.photo_url, updated_at: newUser.updated_at };
    login(appUser, true);
    toast.success("Conta criada com sucesso!");
    navigate("/dashboard");
  };

  const handleAdminLogin = () => {
    if (adminPassword === "88620787") {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      navigate('/admin/users');
      toast.success("Acesso concedido.");
    } else {
      toast.error("Senha incorreta.");
    }
    setIsAlertOpen(false);
    setAdminPassword("");
  };

  const handleRemoveProfile = (usernameToRemove: string) => {
    removeProfile(usernameToRemove);
    const updatedProfiles = savedProfiles.filter(p => p.username !== usernameToRemove);
    setSavedProfiles(updatedProfiles);
    if (updatedProfiles.length === 0) {
      setShowLoginForm(true);
    }
    toast.info("Perfil removido.");
  };

  const getElementEmoji = (element: string | null) => ({ água: "🌊", fogo: "🔥", terra: "🌱", ar: "💨" }[element || ''] || "?");

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-5xl font-bold text-gradient-arcane mb-4 tracking-wide">
            Academia Arcana de Alvorada
          </h1>
          <p className="text-muted-foreground text-lg">
            Desperte o poder dos elementos
          </p>
        </div>

        <Card className="p-8 shadow-card border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
          {!showLoginForm && savedProfiles.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-center font-heading text-2xl text-gradient-arcane">Acessar Perfil</h2>
              {savedProfiles.map(profile => (
                <div key={profile.username} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between group">
                  <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => performLogin(profile.username)}>
                    <Avatar className="w-12 h-12 border-2 border-primary/50">
                      <AvatarImage src={profile.profilePicture || undefined} className="object-cover" />
                      <AvatarFallback>{getElementEmoji(profile.element)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold font-heading">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">@{profile.username.replace(/\d{4}$/, '')}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveProfile(profile.username)}>
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline"
                onClick={() => {
                  setIsCreatingAccount(false);
                  setShowLoginForm(true);
                }}
                className="w-full border-primary/50 hover:bg-primary/10 mt-4"
              >
                Entrar com outra conta
              </Button>
            </div>
          ) : !isCreatingAccount ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base font-heading">Nome de Usuário</Label>
                <VirtualKeyboard
                  placeholder="Ana1313"
                  value={loginUsername}
                  onType={setLoginUsername}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="save-profile" checked={saveProfile} onCheckedChange={setSaveProfile} />
                <Label htmlFor="save-profile">Salvar perfil para acesso rápido</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => performLogin(loginUsername)}
                  className="w-full bg-gradient-arcane hover:opacity-90 transition-opacity shadow-glow"
                >
                  Entrar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsCreatingAccount(true)}
                  className="w-full border-primary/50 hover:bg-primary/10"
                >
                  Criar Conta
                </Button>
              </div>
              {savedProfiles.length > 0 && (
                <Button variant="link" className="w-full h-auto p-1 text-sm" onClick={() => setShowLoginForm(false)}>
                  Voltar para seleção de perfis
                </Button>
              )}
              <div className="text-center">
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="link" className="text-muted-foreground text-xs h-auto p-1">Secreto</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Acesso Secreto</AlertDialogTitle>
                      <AlertDialogDescription>
                        Insira a senha de administrador para continuar.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input 
                      type="password"
                      placeholder="********"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAdminLogin}>Entrar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-heading">Nome Completo</Label>
                <VirtualKeyboard
                  placeholder="Ana Silva"
                  value={name}
                  onType={setName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-username" className="text-base font-heading">Nome de Usuário</Label>
                <VirtualKeyboard
                  placeholder="Ana1313"
                  value={username}
                  onType={setUsername}
                />
                <p className="text-xs text-muted-foreground">Nome + 4 dígitos (ex: wooyoung1918)</p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-heading">Escolha seu Elemento</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleCreateAccount}
                  className="w-full bg-gradient-arcane hover:opacity-90 transition-opacity shadow-glow"
                >
                  Criar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsCreatingAccount(false)}
                  className="w-full border-primary/50 hover:bg-primary/10"
                >
                  Voltar
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;