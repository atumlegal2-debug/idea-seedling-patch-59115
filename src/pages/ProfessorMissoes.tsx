import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
}

interface MissionProgress {
  missionId: string;
  username: string;
  status: "pending" | "completed" | "failed";
}

interface User {
  name: string;
  username: string;
  profilePicture: string | null;
  element: string;
}

const ProfessorMissoes = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionProgress, setMissionProgress] = useState<MissionProgress[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState(20);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const userType = localStorage.getItem("userType");
    
    if (currentUser !== "Professor1812" || userType !== "professor") {
      navigate("/");
      return;
    }

    const storedMissions = JSON.parse(localStorage.getItem("missions") || "[]");
    setMissions(storedMissions);

    const storedProgress = JSON.parse(localStorage.getItem("missionProgress") || "[]");
    setMissionProgress(storedProgress);

    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(storedUsers);
  }, [navigate]);

  const createMission = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Preencha o título e a descrição da missão");
      return;
    }

    const newMission: Mission = {
      id: Date.now().toString(),
      title,
      description,
      xpReward
    };

    const updatedMissions = [...missions, newMission];
    localStorage.setItem("missions", JSON.stringify(updatedMissions));
    setMissions(updatedMissions);
    
    // Reset form
    setTitle("");
    setDescription("");
    setXpReward(20);
    setIsCreating(false);
    
    toast.success("Missão criada com sucesso!");
  };

  const deleteMission = (id: string) => {
    const updatedMissions = missions.filter(m => m.id !== id);
    localStorage.setItem("missions", JSON.stringify(updatedMissions));
    setMissions(updatedMissions);
    
    // Remove progress for this mission
    const updatedProgress = missionProgress.filter(p => p.missionId !== id);
    localStorage.setItem("missionProgress", JSON.stringify(updatedProgress));
    setMissionProgress(updatedProgress);
    
    toast.success("Missão excluída!");
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

  const approveMission = (missionId: string, username: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    // Update mission progress
    const updatedProgress = missionProgress.map(p =>
      p.missionId === missionId && p.username === username
        ? { ...p, status: "completed" as const }
        : p
    );
    localStorage.setItem("missionProgress", JSON.stringify(updatedProgress));
    setMissionProgress(updatedProgress);

    // Give XP to user
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = storedUsers.map((u: any) => {
      if (u.username === username) {
        const newXP = u.xp + mission.xpReward;
        return { ...u, xp: newXP, rank: getRankFromXP(newXP) };
      }
      return u;
    });
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    toast.success(`Missão aprovada! ${username} ganhou ${mission.xpReward} XP`);
  };

  const rejectMission = (missionId: string, username: string) => {
    const updatedProgress = missionProgress.map(p =>
      p.missionId === missionId && p.username === username
        ? { ...p, status: "failed" as const }
        : p
    );
    localStorage.setItem("missionProgress", JSON.stringify(updatedProgress));
    setMissionProgress(updatedProgress);
    toast.info("Missão reprovada.");
  };

  const getPendingStudents = (missionId: string) => {
    return missionProgress.filter(p => p.missionId === missionId && p.status === "pending");
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

  if (isCreating) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button 
            variant="outline" 
            onClick={() => setIsCreating(false)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <Card className="p-8 shadow-card border-2 border-primary/20">
            <h2 className="font-heading text-3xl font-bold mb-6 text-gradient-arcane">
              Nova Missão
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg font-heading">Título da Missão</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Pratique seu elemento por 30 minutos"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-lg font-heading">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva os detalhes da missão..."
                  className="min-h-[150px] text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="xp" className="text-lg font-heading">XP de Recompensa</Label>
                <Input
                  id="xp"
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                  min={1}
                  className="text-base"
                />
              </div>

              <Button 
                onClick={createMission}
                className="w-full bg-gradient-arcane hover:opacity-90 transition-opacity shadow-glow text-lg py-6"
              >
                Criar Missão
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
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
              <h1 className="font-heading text-4xl font-bold text-gradient-arcane">Missões</h1>
              <p className="text-muted-foreground mt-1">Gerenciar missões especiais</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-gradient-arcane hover:opacity-90 transition-opacity gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Missão
          </Button>
        </div>

        {missions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg mb-4">Nenhuma missão criada ainda.</p>
            <Button onClick={() => setIsCreating(true)} className="bg-gradient-arcane">
              Criar Primeira Missão
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {missions.map((mission) => {
              const pendingStudents = getPendingStudents(mission.id);
              
              return (
                <Card key={mission.id} className="p-6 border-2 border-secondary/50">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-heading text-2xl font-bold mb-3">{mission.title}</h3>
                      <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{mission.description}</p>
                      <span className="px-4 py-2 rounded-full bg-gradient-to-br from-secondary to-secondary/70 text-secondary-foreground font-heading inline-block">
                        {mission.xpReward} XP
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteMission(mission.id)}
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </Button>
                  </div>

                  {pendingStudents.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-heading font-bold mb-3">Aguardando Avaliação ({pendingStudents.length})</h4>
                      <div className="space-y-2">
                        {pendingStudents.map((progress) => {
                          const student = users.find(u => u.username === progress.username);
                          if (!student) return null;

                          return (
                            <div key={progress.username} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                {student.profilePicture ? (
                                  <img src={student.profilePicture} alt={student.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-arcane flex items-center justify-center text-white font-heading">
                                    {getElementEmoji(student.element)}
                                  </div>
                                )}
                                <div>
                                  <p className="font-heading font-bold">{student.name}</p>
                                  <p className="text-sm text-muted-foreground">@{student.username}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => approveMission(mission.id, progress.username)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => rejectMission(mission.id, progress.username)}
                                >
                                  Reprovar
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorMissoes;
