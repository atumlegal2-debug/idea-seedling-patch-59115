import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Trophy, LogOut } from "lucide-react";
import { toast } from "sonner";

const Professor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const userType = localStorage.getItem("userType");
    
    if (currentUser !== "Professor1812" || userType !== "professor") {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userType");
    navigate("/");
    toast.success("Até breve, Professor!");
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-heading text-4xl font-bold text-gradient-arcane mb-2">
              Painel do Professor
            </h1>
            <p className="text-muted-foreground">Academia Arcana de Alvorada</p>
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

        {/* Grid Menu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="p-8 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group"
            onClick={() => navigate("/professor/atividades")}
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-arcane rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold">Atividades</h3>
              <p className="text-sm text-muted-foreground">Criar e gerenciar atividades</p>
            </div>
          </Card>

          <Card 
            className="p-8 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group"
            onClick={() => navigate("/professor/missoes")}
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-10 h-10 text-secondary-foreground" />
              </div>
              <h3 className="font-heading text-2xl font-bold">Missões</h3>
              <p className="text-sm text-muted-foreground">Criar e gerenciar missões</p>
            </div>
          </Card>

          <Card 
            className="p-8 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group"
            onClick={() => navigate("/professor/xp")}
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-destructive to-destructive/70 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold">XP</h3>
              <p className="text-sm text-muted-foreground">Distribuir pontos de experiência</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Professor;
