import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import VirtualKeyboard from "@/components/VirtualKeyboard";

interface Student {
  id: string;
  name: string;
  username: string;
  element: "água" | "terra" | "fogo" | "ar" | null;
  xp: number;
  rank: string;
  photo_url: string | null;
  updated_at: string;
}

const ProfessorXP = () => {
  const navigate = useNavigate();
  const { user: professorUser, loading } = useUser();
  const [users, setUsers] = useState<Student[]>([]);
  const [customXpValues, setCustomXpValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !professorUser?.isProfessor) {
      navigate("/");
    }
  }, [professorUser, loading, navigate]);

  const loadUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_professor', false)
      .order('name', { ascending: true });
      
    if (error) {
      toast.error("Erro ao carregar alunos.");
    } else {
      setUsers((data || []).map(u => ({ ...u, element: u.element as Student['element'] })));
    }
  }, []);

  useEffect(() => {
    loadUsers();

    const channel = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('Atualização na tabela de usuários, recarregando...', payload);
          loadUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadUsers]);

  const addXP = async (userId: string, amount: number) => {
    const { error } = await supabase.rpc('add_xp', {
      user_id_param: userId,
      xp_to_add: amount,
    });
    if (error) {
      toast.error("Erro ao atualizar XP.");
    } else {
      toast.success("XP atualizado!");
      // The real-time listener will handle the UI update
    }
  };

  const setXP = async (userId: string, newXP: number) => {
    if (newXP < 0) newXP = 0;
    
    const getRankFromXP = (xp: number): string => {
      if (xp < 50) return "E"; if (xp < 150) return "D"; if (xp < 300) return "C";
      if (xp < 500) return "B"; if (xp < 800) return "A"; if (xp < 1200) return "S";
      return "SS";
    };

    const { error } = await supabase
      .from('users')
      .update({ xp: newXP, rank: getRankFromXP(newXP) })
      .eq('id', userId);

    if (error) {
      toast.error("Erro ao definir XP.");
    } else {
      toast.success("XP definido!");
      // The real-time listener will handle the UI update
    }
  };

  const getElementEmoji = (element: string) => ({ água: "🌊", fogo: "🔥", terra: "🌱", ar: "💨" }[element] || "");
  const getElementGradient = (element: string) => ({ água: "bg-gradient-water", fogo: "bg-gradient-fire", terra: "bg-gradient-earth", ar: "bg-gradient-air" }[element] || "");

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/professor")} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
          <div>
            <h1 className="font-heading text-4xl font-bold text-gradient-arcane">Gerenciar XP</h1>
            <p className="text-muted-foreground mt-1">Distribua pontos de experiência aos alunos</p>
          </div>
        </div>

        {users.length === 0 ? (
          <Card className="p-12 text-center"><p className="text-muted-foreground text-lg">Nenhum aluno cadastrado.</p></Card>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.username} className="p-6 border-2 border-primary/20">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-16 h-16 border-4 border-primary shadow-glow">
                      <AvatarImage src={user.photo_url ? `${user.photo_url}?t=${new Date(user.updated_at).getTime()}` : undefined} className="object-cover" />
                      <AvatarFallback className={`${getElementGradient(user.element || '')} text-white text-2xl font-heading`}>{user.element ? getElementEmoji(user.element) : '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-heading text-xl font-bold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">@{user.username.replace(/\d{4}$/, '')}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full ${getElementGradient(user.element || '')} text-white text-sm font-heading`}>
                          {user.element ? `${getElementEmoji(user.element)} ${user.element.charAt(0).toUpperCase() + user.element.slice(1)}` : 'Sem Elemento'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-gradient-arcane text-white text-sm font-heading">Rank {user.rank}</span>
                        <span className="px-3 py-1 rounded-full border-2 border-secondary bg-card text-sm font-heading">{user.xp} XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label className="text-sm font-heading">Adicionar/Remover XP</Label>
                    <div className="flex gap-2">
                      {[-50, -10, 10, 50, 100].map(amount => (
                        <Button key={amount} variant={amount < 0 ? "outline" : "default"} size="sm" onClick={() => addXP(user.id, amount)} className={`gap-1 ${amount > 0 ? 'bg-gradient-arcane hover:opacity-90' : ''}`}>
                          {amount < 0 ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />} {Math.abs(amount)}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <VirtualKeyboard
                          value={customXpValues[user.id] || ""}
                          onType={(val) => setCustomXpValues(prev => ({ ...prev, [user.id]: val }))}
                          placeholder="XP customizado"
                        />
                      </div>
                      <Button size="sm" onClick={() => {
                        const amount = parseInt(customXpValues[user.id] || '0');
                        if (!isNaN(amount)) {
                          setXP(user.id, amount);
                          setCustomXpValues(prev => ({ ...prev, [user.id]: "" }));
                        }
                      }} className="bg-gradient-arcane hover:opacity-90">Definir</Button>
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