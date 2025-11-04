import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import VirtualKeyboard from "@/components/VirtualKeyboard";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ProfessorMissoes = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [missions, setMissions] = useState<any[]>([]);
  const [missionProgress, setMissionProgress] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState(20);

  const fetchData = useCallback(async () => {
    const { data: missionsData, error: missionsError } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });
    if (missionsError) toast.error("Erro ao carregar missões.");
    else setMissions(missionsData || []);

    const { data: progressData, error: progressError } = await supabase
      .from('mission_progress')
      .select('*, users(*), missions(xp_reward)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (progressError) toast.error("Erro ao carregar progresso.");
    else setMissionProgress(progressData || []);
  }, []);

  useEffect(() => {
    fetchData();

    const progressChannel = supabase
      .channel('public:mission_progress')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_progress' }, () => fetchData())
      .subscribe();

    const missionsChannel = supabase
      .channel('public:missions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(missionsChannel);
    };
  }, [fetchData]);

  const createMission = async () => {
    if (!title.trim() || !description.trim() || !user) {
      toast.error("Preencha todos os campos");
      return;
    }
    const { error } = await supabase.from('missions').insert({
      title,
      description,
      xp_reward: xpReward,
      professor_id: user.id,
    });
    if (error) {
      toast.error("Erro ao criar missão.");
    } else {
      toast.success("Missão criada com sucesso!");
      setTitle("");
      setDescription("");
      setXpReward(20);
      setIsCreating(false);
      // No need to call fetchData(), the real-time listener will handle it
    }
  };

  const deleteMission = async (id: string) => {
    const { error } = await supabase.from('missions').delete().eq('id', id);
    if (error) {
      toast.error("Erro ao excluir missão.");
    } else {
      toast.success("Missão excluída!");
      // No need to call fetchData(), the real-time listener will handle it
    }
  };

  const approveMission = async (progress: any) => {
    const { error: updateError } = await supabase
      .from('mission_progress')
      .update({ status: 'completed' })
      .eq('id', progress.id);
    if (updateError) {
      toast.error("Erro ao aprovar missão.");
      return;
    }
    const { error: rpcError } = await supabase.rpc('add_xp', {
      user_id_param: progress.student_id,
      xp_to_add: progress.missions.xp_reward,
    });
    if (rpcError) {
      toast.error("Erro ao conceder XP.");
    } else {
      toast.success(`Missão de ${progress.users.name} aprovada!`);
      // No need to call fetchData(), the real-time listener will handle it
    }
  };

  const rejectMission = async (progressId: string) => {
    const { error } = await supabase
      .from('mission_progress')
      .update({ status: 'failed' })
      .eq('id', progressId);
    if (error) {
      toast.error("Erro ao reprovar missão.");
    } else {
      toast.info("Missão reprovada.");
      // No need to call fetchData(), the real-time listener will handle it
    }
  };

  const getElementEmoji = (element: string | null) => ({ água: "🌊", fogo: "🔥", terra: "🌱", ar: "💨" }[element || ''] || "?");

  if (isCreating) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => setIsCreating(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
          <Card className="p-8 shadow-card border-2 border-primary/20">
            <h2 className="font-heading text-3xl font-bold mb-6 text-gradient-arcane">Nova Missão</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg font-heading">Título da Missão</Label>
                <VirtualKeyboard id="title" value={title} onType={setTitle} placeholder="Ex: Pratique seu elemento por 30 minutos" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-lg font-heading">Descrição</Label>
                <VirtualKeyboard id="description" value={description} onType={setDescription} placeholder="Descreva os detalhes da missão..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="xp" className="text-lg font-heading">XP de Recompensa</Label>
                <VirtualKeyboard id="xp" value={xpReward.toString()} onType={(val) => setXpReward(Number(val) || 0)} placeholder="20" />
              </div>
              <Button onClick={createMission} className="w-full bg-gradient-arcane hover:opacity-90 transition-opacity shadow-glow text-lg py-6">Criar Missão</Button>
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
            <Button variant="outline" onClick={() => navigate("/professor")} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
            <div>
              <h1 className="font-heading text-4xl font-bold text-gradient-arcane">Missões</h1>
              <p className="text-muted-foreground mt-1">Gerenciar missões especiais</p>
            </div>
          </div>
          <Button onClick={() => setIsCreating(true)} className="bg-gradient-arcane hover:opacity-90 transition-opacity gap-2"><Plus className="w-4 h-4" /> Nova Missão</Button>
        </div>

        {missions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg mb-4">Nenhuma missão criada ainda.</p>
            <Button onClick={() => setIsCreating(true)} className="bg-gradient-arcane">Criar Primeira Missão</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {missions.map((mission) => {
              const pendingStudents = missionProgress.filter(p => p.mission_id === mission.id);
              return (
                <Card key={mission.id} className="p-6 border-2 border-secondary/50">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-heading text-2xl font-bold mb-3">{mission.title}</h3>
                      <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{mission.description}</p>
                      <span className="px-4 py-2 rounded-full bg-gradient-to-br from-secondary to-secondary/70 text-secondary-foreground font-heading inline-block">{mission.xp_reward} XP</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteMission(mission.id)}><Trash2 className="w-5 h-5 text-destructive" /></Button>
                  </div>
                  {pendingStudents.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-heading font-bold mb-3">Aguardando Avaliação ({pendingStudents.length})</h4>
                      <div className="space-y-2">
                        {pendingStudents.map((progress) => (
                          <div key={progress.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border-2 border-primary">
                                <AvatarImage src={progress.users.photo_url || undefined} />
                                <AvatarFallback>{getElementEmoji(progress.users.element)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-heading font-bold">{progress.users.name}</p>
                                <p className="text-sm text-muted-foreground">@{progress.users.username}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => approveMission(progress)} className="bg-green-600 hover:bg-green-700">Aprovar</Button>
                              <Button size="sm" variant="destructive" onClick={() => rejectMission(progress.id)}>Reprovar</Button>
                            </div>
                          </div>
                        ))}
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