import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";

const Missoes = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [missions, setMissions] = useState<any[]>([]);
  const [missionProgress, setMissionProgress] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;

    const { data: missionsData, error: missionsError } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });
    if (missionsError) toast.error("Erro ao carregar missões.");
    else setMissions(missionsData || []);

    const { data: progressData, error: progressError } = await supabase
      .from('mission_progress')
      .select('*')
      .eq('student_id', user.id);
    if (progressError) toast.error("Erro ao carregar seu progresso.");
    else setMissionProgress(progressData || []);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!user) return;

    const progressChannel = supabase
      .channel(`public:mission_progress:student_id=eq.${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_progress', filter: `student_id=eq.${user.id}` },
        (payload) => {
          const newStatus = (payload.new as any)?.status;
          if (newStatus === 'completed') toast.success("Sua missão foi aprovada!");
          if (newStatus === 'failed') toast.error("Sua missão foi reprovada.");
          fetchData();
        }
      )
      .subscribe();

    const missionsChannel = supabase
      .channel('public:missions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.info("Uma nova missão está disponível!");
          }
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(missionsChannel);
    };
  }, [user, fetchData]);

  const handleAcceptMission = async (mission: any) => {
    if (!user) return;
    const { error } = await supabase.from('mission_progress').insert({
      mission_id: mission.id,
      student_id: user.id,
    });
    if (error) {
      if (error.code === '23505') toast.error("Você já aceitou esta missão.");
      else toast.error("Erro ao aceitar missão.");
    } else {
      toast.success("Missão aceita! Complete-a e aguarde a avaliação do professor.");
      fetchData();
    }
  };

  const getMissionStatus = (missionId: string) => {
    return missionProgress.find(p => p.mission_id === missionId);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
          <div>
            <h1 className="font-heading text-4xl font-bold text-gradient-arcane">Missões</h1>
            <p className="text-muted-foreground mt-1">Complete missões especiais e ganhe XP</p>
          </div>
        </div>

        {missions.length === 0 ? (
          <Card className="p-12 text-center"><p className="text-muted-foreground text-lg">Nenhuma missão disponível no momento.</p></Card>
        ) : (
          <div className="space-y-4">
            {missions.map((mission) => {
              const status = getMissionStatus(mission.id);
              return (
                <Card 
                  key={mission.id}
                  className={`group relative overflow-hidden transition-all duration-300 ${
                    status?.status === "completed" ? "border-2 border-green-500/30 bg-gradient-to-br from-green-950/40 to-green-900/20 shadow-lg shadow-green-500/20" 
                    : status?.status === "failed" ? "border-2 border-red-500/30 bg-gradient-to-br from-red-950/40 to-red-900/20 shadow-lg shadow-red-500/20"
                    : status?.status === "pending" ? "border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-950/40 to-yellow-900/20 shadow-lg shadow-yellow-500/20"
                    : "border-2 border-secondary/30 bg-card/80 backdrop-blur hover:border-secondary hover:shadow-glow hover:scale-[1.02]"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-arcane opacity-5 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-arcane opacity-5 rounded-full blur-2xl" />
                  <div className="relative p-8">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-heading text-3xl font-bold text-gradient-arcane">{mission.title}</h3>
                          <div className="h-1 w-24 bg-gradient-arcane rounded-full opacity-60" />
                        </div>
                        <p className="text-foreground/80 text-lg leading-relaxed whitespace-pre-wrap">{mission.description}</p>
                        <div className="flex flex-wrap gap-4 items-center pt-4">
                          <div className="px-6 py-3 rounded-lg bg-gradient-to-br from-secondary via-secondary/90 to-secondary/70 text-secondary-foreground font-heading text-lg font-bold shadow-card border border-secondary/20">
                            ⚡ {mission.xp_reward} XP
                          </div>
                          {!status ? (
                            <Button onClick={() => handleAcceptMission(mission)} className="bg-gradient-arcane hover:opacity-90 transition-all shadow-glow hover:shadow-xl px-8 py-6 text-lg font-heading">✨ Aceitar Missão</Button>
                          ) : status.status === "pending" ? (
                            <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 font-semibold text-lg">
                              <CheckCircle2 className="w-6 h-6 animate-pulse" /> Aguardando Avaliação
                            </div>
                          ) : status.status === "completed" ? (
                            <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 font-semibold text-lg">
                              <CheckCircle2 className="w-6 h-6" /> ✓ Concluída
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-semibold text-lg">
                              <CheckCircle2 className="w-6 h-6" /> ✗ Reprovada
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Missoes;