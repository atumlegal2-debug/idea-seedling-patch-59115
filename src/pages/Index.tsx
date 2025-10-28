import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import heroImage from "@/assets/academy-hero-enhanced.jpg";
import waterIcon from "@/assets/water-element.png";
import fireIcon from "@/assets/fire-element.png";
import earthIcon from "@/assets/earth-element.png";
import airIcon from "@/assets/air-element.png";
import { useUser, AppUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import VirtualKeyboard from "@/components/VirtualKeyboard";

const Index = () => {
  const navigate = useNavigate();
  const { user, login, loading } = useUser();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  
  const [loginUsername, setLoginUsername] = useState("");
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [element, setElement] = useState<"água" | "terra" | "fogo" | "ar" | "">("");

  useEffect(() => {
    if (user) {
      navigate(user.isProfessor ? "/professor" : "/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    if (!loginUsername.trim()) {
      toast.error("Por favor, insira seu nome de usuário");
      return;
    }

    if (loginUsername === "Professor1812") {
      const professorUser: AppUser = {
        id: 'professor-id',
        name: 'Professor',
        username: 'Professor1812',
        isProfessor: true,
        element: 'fogo', xp: 9999, rank: 'SS', profilePicture: null
      };
      login(professorUser);
      navigate("/professor");
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', loginUsername)
      .single();

    if (error || !data) {
      toast.error("Usuário não encontrado");
      return;
    }
    
    const appUser: AppUser = { ...data, isProfessor: false, profilePicture: data.photo_url };
    login(appUser);
    navigate("/dashboard");
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
      .insert({ name, username, element })
      .select()
      .single();

    if (error || !newUser) {
      toast.error("Erro ao criar conta.");
      console.error(error);
      return;
    }
    
    const appUser: AppUser = { ...newUser, isProfessor: false, profilePicture: newUser.photo_url };
    login(appUser);
    toast.success("Conta criada com sucesso!");
    navigate("/dashboard");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-auto">
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
          {!isCreatingAccount ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base font-heading">Nome de Usuário</Label>
                <VirtualKeyboard
                  placeholder="Ana1313"
                  value={loginUsername}
                  onType={setLoginUsername}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleLogin}
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

              <Button 
                variant="ghost"
                onClick={() => setLoginUsername("Professor1812")}
                className="w-full text-secondary hover:text-secondary/80 hover:bg-secondary/10"
              >
                Acesso Professor
              </Button>
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