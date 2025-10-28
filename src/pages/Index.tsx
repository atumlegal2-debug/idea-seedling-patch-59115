import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import heroImage from "@/assets/academy-hero-enhanced.jpg";
import waterIcon from "@/assets/water-element.png";
import fireIcon from "@/assets/fire-element.png";
import earthIcon from "@/assets/earth-element.png";
import airIcon from "@/assets/air-element.png";

const Index = () => {
  const navigate = useNavigate();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [saveLogin, setSaveLogin] = useState(false);
  
  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  
  // Registration state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [element, setElement] = useState<"água" | "terra" | "fogo" | "ar" | "">("");

  const handleLogin = () => {
    if (!loginUsername.trim()) {
      toast.error("Por favor, insira seu nome de usuário");
      return;
    }

    // Check if it's professor
    if (loginUsername === "Professor1812") {
      if (saveLogin) {
        localStorage.setItem("savedUser", loginUsername);
        localStorage.setItem("userType", "professor");
      }
      localStorage.setItem("currentUser", loginUsername);
      localStorage.setItem("userType", "professor");
      navigate("/professor");
      return;
    }

    // Check if user exists
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: any) => u.username === loginUsername);

    if (!user) {
      toast.error("Usuário não encontrado");
      return;
    }

    if (saveLogin) {
      localStorage.setItem("savedUser", loginUsername);
      localStorage.setItem("userType", "student");
    }
    localStorage.setItem("currentUser", loginUsername);
    localStorage.setItem("userType", "student");
    navigate("/dashboard");
  };

  const handleCreateAccount = () => {
    if (!name.trim() || !username.trim() || !element) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Validate username format (name + 4 digits)
    const usernameRegex = /^[a-zA-Z]+\d{4}$/;
    if (!usernameRegex.test(username)) {
      toast.error("Nome de usuário deve ser um nome seguido de 4 dígitos (ex: Ana1313)");
      return;
    }

    // Check if username already exists
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u: any) => u.username === username)) {
      toast.error("Nome de usuário já existe");
      return;
    }

    // Create new user
    const newUser = {
      name,
      username,
      element,
      xp: 0,
      rank: "E",
      profilePicture: null,
      completedActivities: [],
      completedMissions: []
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", username);
    localStorage.setItem("userType", "student");
    
    toast.success("Conta criada com sucesso!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background */}
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

      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo/Title */}
        <div className="text-center space-y-2">
          <h1 className="font-heading text-5xl font-bold text-gradient-arcane mb-4 tracking-wide">
            Academia Arcana de Alvorada
          </h1>
          <p className="text-muted-foreground text-lg">
            Desperte o poder dos elementos
          </p>
        </div>

        {/* Login/Register Card */}
        <Card className="p-8 shadow-card border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
          {!isCreatingAccount ? (
            // Login Form
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base font-heading">Nome de Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ana1313"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  className="text-base"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="save-login" 
                  checked={saveLogin}
                  onCheckedChange={(checked) => setSaveLogin(checked as boolean)}
                />
                <Label 
                  htmlFor="save-login" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Salvar login
                </Label>
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
                onClick={() => {
                  setLoginUsername("Professor1812");
                  toast.info("Use: Professor1812");
                }}
                className="w-full text-secondary hover:text-secondary/80 hover:bg-secondary/10"
              >
                Acesso Professor
              </Button>
            </div>
          ) : (
            // Registration Form
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-heading">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ana Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-username" className="text-base font-heading">Nome de Usuário</Label>
                <Input
                  id="new-username"
                  type="text"
                  placeholder="Ana1313"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-base"
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
