import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface User {
  name: string;
  username: string;
  element: "água" | "terra" | "fogo" | "ar";
  xp: number;
  rank: string;
  profilePicture: string | null;
}

const ProfessorXP = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const userType = localStorage.getItem("userType");
    
    if (currentUser !== "Professor1812" || userType !== "professor") {
      navigate("/");
      return;
    }

    loadUsers();
  }, [navigate]);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(storedUsers);
  };

  const getRankFromXP = (xp: number): string => {
    if (xp < 50) return "E";
    if (xp < 150) return "D";
    if (xp < 300) return "C";
    if (xp < 500) return "B";
    if (xp < 800) return "A";
    if (xp < 1200) return "S";
    return "SS";
  };

  const updateUserXP = (username: string, newXP: number) => {
    if (newXP < 0) newXP = 0;

    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = storedUsers.map((u: User) => 
      u.username === username 
        ? { ...u, xp: newXP, rank: getRankFromXP(newXP) }
        : u
    );
    
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    loadUsers();
    toast.success("XP atualizado!");
  };

  const addXP = (username: string, amount: number) => {
    const user = users.find(u => u.username === username);
    if (user) {
      updateUserXP(username, user.xp + amount);
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

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/professor")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="font-heading text-4xl font-bold text-gradient-arcane">Gerenciar XP</h1>
            <p className="text-muted-foreground mt-1">Distribua pontos de experiência aos alunos</p>
          </div>
        </div>

        {users.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">Nenhum aluno cadastrado ainda.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.username} className="p-6 border-2 border-primary/20">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-16 h-16 border-4 border-primary shadow-glow">
                      <AvatarImage src={user.profilePicture || undefined} />
                      <AvatarFallback className={`${getElementGradient(user.element)} text-white text-2xl font-heading`}>
                        {getElementEmoji(user.element)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-heading text-xl font-bold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">@{user.username}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full ${getElementGradient(user.element)} text-white text-sm font-heading`}>
                          {getElementEmoji(user.element)} {user.element.charAt(0).toUpperCase() + user.element.slice(1)}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-gradient-arcane text-white text-sm font-heading">
                          Rank {user.rank}
                        </span>
                        <span className="px-3 py-1 rounded-full border-2 border-secondary bg-card text-sm font-heading">
                          {user.xp} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Label className="text-sm font-heading">Adicionar/Remover XP</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addXP(user.username, -10)}
                        className="gap-1"
                      >
                        <Minus className="w-3 h-3" />
                        10
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addXP(user.username, -50)}
                        className="gap-1"
                      >
                        <Minus className="w-3 h-3" />
                        50
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => addXP(user.username, 10)}
                        className="bg-gradient-arcane hover:opacity-90 gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        10
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => addXP(user.username, 50)}
                        className="bg-gradient-arcane hover:opacity-90 gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        50
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => addXP(user.username, 100)}
                        className="bg-gradient-arcane hover:opacity-90 gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        100
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        placeholder="XP customizado"
                        id={`custom-xp-${user.username}`}
                        className="text-sm"
                        min={0}
                      />
                      <Button 
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(`custom-xp-${user.username}`) as HTMLInputElement;
                          const amount = parseInt(input.value);
                          if (!isNaN(amount)) {
                            updateUserXP(user.username, amount);
                            input.value = "";
                          }
                        }}
                        className="bg-gradient-arcane hover:opacity-90"
                      >
                        Definir
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorXP;
