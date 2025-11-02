import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import VirtualKeyboard from "@/components/VirtualKeyboard";

interface Statement {
  id: string;
  text: string;
  isTrue: boolean;
}

interface Question {
  id: string;
  text: string;
  type: "multiple" | "true-false";
  options?: string[];
  statements?: Statement[];
  correctAnswer?: string;
}

interface Activity {
  id: string;
  title: string;
  text: string;
  questions: Question[];
  xp_reward: number;
  activity_submissions: any[];
}

const ProfessorAtividades = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [xpReward, setXpReward] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionType, setCurrentQuestionType] = useState<"multiple" | "true-false">("true-false");
  const [currentOptions, setCurrentOptions] = useState<string[]>(["", "", "", ""]);
  const [currentCorrectAnswer, setCurrentCorrectAnswer] = useState("");
  
  const [currentStatements, setCurrentStatements] = useState<Statement[]>([]);
  const [newStatementText, setNewStatementText] = useState("");

  useEffect(() => {
    if (!loading && !user?.isProfessor) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const fetchActivities = useCallback(async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*, activity_submissions(*, users(name))')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Erro ao carregar atividades.");
    } else {
      setActivities(data || []);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    const channel = supabase
      .channel('public:activity_submissions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_submissions' },
        (payload) => {
          toast.info("Nova submissão recebida!");
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities]);

  const addStatement = () => {
    if (!newStatementText.trim()) return;
    const newStatement: Statement = { id: Date.now().toString(), text: newStatementText, isTrue: true };
    setCurrentStatements([...currentStatements, newStatement]);
    setNewStatementText("");
  };

  const removeStatement = (id: string) => setCurrentStatements(currentStatements.filter(s => s.id !== id));
  const toggleStatementTruth = (id: string) => setCurrentStatements(currentStatements.map(s => s.id === id ? { ...s, isTrue: !s.isTrue } : s));

  const addQuestion = () => {
    if (!currentQuestion.trim()) {
      toast.error("Preencha a pergunta");
      return;
    }
    let newQuestion: Question;
    if (currentQuestionType === "multiple") {
      if (!currentCorrectAnswer) {
        toast.error("Selecione a resposta correta");
        return;
      }
      newQuestion = { id: Date.now().toString(), text: currentQuestion, type: "multiple", options: currentOptions.filter(o => o.trim()), correctAnswer: currentCorrectAnswer };
    } else {
      if (currentStatements.length === 0) {
        toast.error("Adicione pelo menos uma afirmação");
        return;
      }
      newQuestion = { id: Date.now().toString(), text: currentQuestion, type: "true-false", statements: currentStatements };
    }
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion("");
    setCurrentOptions(["", "", "", ""]);
    setCurrentCorrectAnswer("");
    setCurrentStatements([]);
    toast.success("Pergunta adicionada!");
  };

  const removeQuestion = (id: string) => setQuestions(questions.filter(q => q.id !== id));

  const createActivity = async () => {
    if (!title.trim() || !text.trim() || questions.length === 0) {
      toast.error("Preencha todos os campos e adicione pelo menos uma pergunta");
      return;
    }
    const { error } = await supabase.from('activities').insert({ title, text, questions, xp_reward: xpReward });
    if (error) {
      toast.error("Erro ao criar atividade.");
    } else {
      toast.success("Atividade criada com sucesso!");
      fetchActivities();
      setTitle("");
      setText("");
      setQuestions([]);
      setXpReward(10);
      setIsCreating(false);
    }
  };

  const deleteActivity = async (id: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) {
      toast.error("Erro ao excluir atividade.");
    } else {
      toast.success("Atividade excluída!");
      fetchActivities();
    }
  };

  if (isCreating) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => setIsCreating(false)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <Card className="p-8 shadow-card border-2 border-primary/30 bg-card/80 backdrop-blur">
            <h2 className="font-heading text-3xl font-bold mb-6 text-gradient-arcane">Nova Atividade</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg font-heading">Título</Label>
                <VirtualKeyboard id="title" value={title} onType={setTitle} placeholder="Ex: Elementos da Natureza" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text" className="text-lg font-heading">Texto da Atividade</Label>
                <VirtualKeyboard id="text" value={text} onType={setText} placeholder="Escreva o conteúdo da aula aqui..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="xp" className="text-lg font-heading">XP ao Completar</Label>
                <VirtualKeyboard id="xp" value={xpReward.toString()} onType={(val) => setXpReward(Number(val) || 0)} placeholder="10" />
              </div>
              <div className="border-t pt-6">
                <h3 className="font-heading text-xl font-bold mb-4">Adicionar Pergunta</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Pergunta</Label>
                    <RadioGroup value={currentQuestionType} onValueChange={(value: any) => setCurrentQuestionType(value)} className="flex gap-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="true-false" id="true-false" /><Label htmlFor="true-false">Verdadeiro ou Falso</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="multiple" id="multiple" /><Label htmlFor="multiple">Múltipla Escolha</Label></div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2"><Label>Pergunta</Label><VirtualKeyboard value={currentQuestion} onType={setCurrentQuestion} placeholder="Digite a pergunta" /></div>
                  {currentQuestionType === "true-false" ? (
                    <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border/50">
                      <Label className="text-base font-heading">Afirmações</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <VirtualKeyboard value={newStatementText} onType={setNewStatementText} placeholder="Digite uma afirmação" />
                        </div>
                        <Button onClick={addStatement} variant="outline" size="icon"><Plus className="w-4 h-4" /></Button>
                      </div>
                      {currentStatements.map((s) => (
                        <Card key={s.id} className="p-3 bg-background/50 flex items-center gap-3">
                          <Switch checked={s.isTrue} onCheckedChange={() => toggleStatementTruth(s.id)} />
                          <span className={`text-sm ${s.isTrue ? 'text-green-400' : 'text-red-400'}`}>{s.isTrue ? 'V' : 'F'}</span>
                          <p className="text-sm flex-1">{s.text}</p>
                          <Button variant="ghost" size="sm" onClick={() => removeStatement(s.id)}><X className="w-4 h-4" /></Button>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Opções de Resposta</Label>
                        {currentOptions.map((o, i) => <VirtualKeyboard key={i} value={o} onType={(val) => setCurrentOptions(currentOptions.map((opt, idx) => idx === i ? val : opt))} placeholder={`Opção ${i + 1}`} />)}
                      </div>
                      <div className="space-y-2">
                        <Label>Resposta Correta</Label>
                        <RadioGroup value={currentCorrectAnswer} onValueChange={setCurrentCorrectAnswer}>
                          {currentOptions.filter(o => o.trim()).map((o, i) => <div key={i} className="flex items-center space-x-2"><RadioGroupItem value={o} id={`c-${i}`} /><Label htmlFor={`c-${i}`}>{o}</Label></div>)}
                        </RadioGroup>
                      </div>
                    </>
                  )}
                  <Button onClick={addQuestion} className="gap-2 bg-gradient-arcane hover:opacity-90"><Plus className="w-4 h-4" /> Adicionar Pergunta</Button>
                </div>
              </div>
              {questions.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-heading text-xl font-bold mb-4">Perguntas ({questions.length})</h3>
                  <div className="space-y-3">
                    {questions.map((q, i) => (
                      <Card key={q.id} className="p-4 bg-muted/30 flex justify-between items-start gap-4">
                        <div className="flex-1"><p className="font-semibold mb-2">{i + 1}. {q.text}</p></div>
                        <Button variant="ghost" size="sm" onClick={() => removeQuestion(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={createActivity} className="w-full bg-gradient-arcane hover:opacity-90 shadow-glow text-lg py-6">Criar Atividade</Button>
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
              <h1 className="font-heading text-4xl font-bold text-gradient-arcane">Atividades</h1>
              <p className="text-muted-foreground mt-1">Gerenciar atividades dos alunos</p>
            </div>
          </div>
          <Button onClick={() => setIsCreating(true)} className="bg-gradient-arcane hover:opacity-90 gap-2"><Plus className="w-4 h-4" /> Nova Atividade</Button>
        </div>
        {activities.length === 0 ? (
          <Card className="p-12 text-center"><p className="text-muted-foreground text-lg mb-4">Nenhuma atividade criada.</p><Button onClick={() => setIsCreating(true)}>Criar Primeira Atividade</Button></Card>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const pending = activity.activity_submissions.filter(s => s.status === 'pending');
              return (
                <Card key={activity.id} className="p-6 border-2 border-primary/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-heading text-xl font-bold mb-2">{activity.title}</h3>
                      <p className="text-muted-foreground line-clamp-2 mb-3">{activity.text}</p>
                      <div className="flex gap-3 text-sm">
                        <span className="px-3 py-1 rounded-full bg-gradient-arcane text-white">{activity.xp_reward} XP</span>
                        <span className="px-3 py-1 rounded-full bg-muted">{activity.questions.length} perguntas</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteActivity(activity.id)}><Trash2 className="w-5 h-5 text-destructive" /></Button>
                  </div>
                  {activity.activity_submissions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <h4 className="font-heading font-semibold mb-2">Submissões ({pending.length} pendentes)</h4>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                        {activity.activity_submissions.map(sub => (
                          <div key={sub.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                            <p>{sub.users.name}</p>
                            {sub.status === 'pending' ? (
                              <Button size="sm" variant="outline" onClick={() => navigate(`/professor/submission/${sub.id}`)} className="gap-2"><Eye className="w-4 h-4" /> Revisar</Button>
                            ) : (
                              <span className="text-sm text-green-400">Nota: {sub.score}/10</span>
                            )}
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

export default ProfessorAtividades;