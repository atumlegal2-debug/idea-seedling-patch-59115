import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Home, Trees } from "lucide-react";
import { toast } from "sonner";

const Locations = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const isLocationAuthenticated = sessionStorage.getItem('isLocationAuthenticated');
    if (isLocationAuthenticated !== 'true') {
      toast.error("Acesso negado. Por favor, insira a senha.");
      const path = user?.isProfessor ? "/professor" : "/dashboard";
      navigate(path);
    }
  }, [navigate, user]);

  const allLocations = [
    { name: "Sala de Aula - Prof. Wooyoung", path: "sala-wooyoung", icon: <BookOpen className="w-10 h-10 text-white" />, gradient: "bg-gradient-arcane" },
    { name: "Sala de Aula - Prof. Romeo", path: "sala-romeo", icon: <BookOpen className="w-10 h-10 text-white" />, gradient: "bg-gradient-arcane" },
    { name: "Sala de Aula - Prof. Niki", path: "sala-niki", icon: <BookOpen className="w-10 h-10 text-white" />, gradient: "bg-gradient-arcane" },
    { name: "Floresta Arcana", path: "floresta", icon: <Trees className="w-10 h-10 text-white" />, gradient: "bg-gradient-earth" },
    { name: "Dormitório dos Alunos", path: "dormitorio", icon: <Home className="w-10 h-10 text-white" />, gradient: "bg-gradient-to-br from-secondary to-secondary/70", studentOnly: true },
  ];

  const visibleLocations = user?.isProfessor
    ? allLocations.filter(loc => !loc.studentOnly)
    : allLocations;

  const handleBack = () => {
    const path = user?.isProfessor ? "/professor" : "/dashboard";
    navigate(path);
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="font-heading text-4xl font-bold text-gradient-arcane">Locais</h1>
            <p className="text-muted-foreground mt-1">Explore e converse em tempo real</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleLocations.map((location) => (
            <Card 
              key={location.path}
              className="p-8 cursor-pointer hover:shadow-glow transition-all border-2 border-transparent hover:border-primary/50 group"
              onClick={() => navigate(`/chat/${location.path}`)}
            >
              <div className="text-center space-y-4">
                <div className={`w-20 h-20 mx-auto ${location.gradient} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {location.icon}
                </div>
                <h3 className="font-heading text-2xl font-bold">{location.name}</h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Locations;