import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

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
  xpReward: number;
}

const ProfessorAtividades = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [xpReward, setXpReward] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionType, setCurrentQuestionType] = useState<"multiple" | "true-false">("true-false");
  const [currentOptions, setCurrentOptions] = useState<string[]>(["", "", "", ""]);
  const [currentCorrectAnswer, setCurrentCorrectAnswer] = useState("");
  
  // For true-false type
  const [currentStatements, setCurrentStatements] = useState<Statement[]>([]);
  const [newStatementText, setNewStatementText] = useState("");

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const userType = localStorage.getItem("userType");
    
    if (currentUser !== "Professor1812" || userType !== "professor") {
      navigate("/");
      return;
    }

    const storedActivities = JSON.parse(localStorage.getItem("activities") || "[]");
    setActivities(storedActivities);
  }, [navigate]);

  const addStatement = () => {
    if (!newStatementText.trim()) {
      toast.error("Digite uma afirmação");
      return;
    }

    const newStatement: Statement = {
      id: Date.now().toString() + Math.random(),
      text: newStatementText,
      isTrue: true
    };

    setCurrentStatements([...currentStatements, newStatement]);
    setNewStatementText("");
  };

  const removeStatement = (id: string) => {
    setCurrentStatements(currentStatements.filter(s => s.id !== id));
  };

  const toggleStatementTruth = (id: string) => {
    setCurrentStatements(currentStatements.map(s => 
      s.id === id ? { ...s, isTrue: !s.isTrue } : s
    ));
  };

  const addQuestion = () => {
    if (!currentQuestion.trim()) {
      toast.error("Preencha a pergunta");
      return;
    }

    if (currentQuestionType === "multiple") {
      if (!currentCorrectAnswer) {
        toast.error("Selecione a resposta correta");
        return;
      }

      const newQuestion: Question = {
        id: Date.now().toString(),
        text: currentQuestion,
        type: "multiple",
        options: currentOptions.filter(o => o.trim()),
        correctAnswer: currentCorrectAnswer
      };

      setQuestions([...questions, newQuestion]);
    } else {
      if (currentStatements.length === 0) {
        toast.error("Adicione pelo menos uma afirmação");
        return;
      }

      const newQuestion: Question = {
        id: Date.now().toString(),
        text: currentQuestion,
        type: "true-false",
        statements: currentStatements
      };

      setQuestions([...questions, newQuestion]);
    }

    setCurrentQuestion("");
    setCurrentOptions(["", "", "", ""]);
    setCurrentCorrectAnswer("");
    setCurrentStatements([]);
    toast.success("Pergunta adicionada!");
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const createActivity = () => {
    if (!title.trim() || !text.trim() || questions.length === 0) {
      toast.error("Preencha todos os campos e adicione pelo menos uma pergunta");
      return;
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      title,
      text,
      questions,
      xpReward
    };

    const updatedActivities = [...activities, newActivity];
    localStorage.setItem("activities", JSON.stringify(updatedActivities));
    setActivities(updatedActivities);
    
    // Reset form
    setTitle("");
    setText("");
    setQuestions([]);
    setXpReward(10);
    setIsCreating(false);
    
    toast.success("Atividade criada com sucesso!");
  };

  const deleteActivity = (id: string) => {
    const updatedActivities = activities.filter(a => a.id !== id);
    localStorage.setItem("activities", JSON.stringify(updatedActivities));
    setActivities(updatedActivities);
    toast.success("Atividade excluída!");
  };

  if (isCreating) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button 
            variant="outline" 
            onClick={() => setIsCreating(false)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <Card className="p-8 shadow-card border-2 border-primary/30 bg-card/80 backdrop-blur">
            <h2 className="font-heading text-3xl font-bold mb-6 text-gradient-arcane">
              Nova Atividade
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg font-heading">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Elementos da Natureza"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text" className="text-lg font-heading">Texto da Atividade</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escreva o conteúdo da aula aqui..."
                  className="min-h-[200px] text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="xp" className="text-lg font-heading">XP ao Completar</Label>
                <Input
                  id="xp"
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                  min={1}
                  className="text-base"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="font-heading text-xl font-bold mb-4">Adicionar Pergunta</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Pergunta</Label>
                    <RadioGroup 
                      value={currentQuestionType} 
                      onValueChange={(value: any) => {
                        setCurrentQuestionType(value);
                        setCurrentCorrectAnswer("");
                        setCurrentStatements([]);
                      }}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true-false" id="true-false" />
                        <Label htmlFor="true-false" className="cursor-pointer">Verdadeiro ou Falso (com afirmações)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multiple" id="multiple" />
                        <Label htmlFor="multiple" className="cursor-pointer">Múltipla Escolha</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Pergunta</Label>
                    <Input
                      value={currentQuestion}
                      onChange={(e) => setCurrentQuestion(e.target.value)}
                      placeholder="Digite a pergunta"
                    />
                  </div>

                  {currentQuestionType === "true-false" ? (
                    <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border/50">
                      <Label className="text-base font-heading">Afirmações</Label>
                      <p className="text-sm text-muted-foreground">
                        Adicione afirmações e marque se cada uma é verdadeira ou falsa
                      </p>
                      
                      <div className="flex gap-2">
                        <Input
                          value={newStatementText}
                          onChange={(e) => setNewStatementText(e.target.value)}
                          placeholder="Digite uma afirmação"
                          onKeyPress={(e) => e.key === "Enter" && addStatement()}
                          className="bg-background/50"
                        />
                        <Button onClick={addStatement} variant="outline" size="icon">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {currentStatements.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {currentStatements.map((statement) => (
                            <Card key={statement.id} className="p-3 bg-background/50">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 flex-1">
                                  <Switch
                                    checked={statement.isTrue}
                                    onCheckedChange={() => toggleStatementTruth(statement.id)}
                                  />
                                  <span className={`text-sm ${statement.isTrue ? 'text-green-400' : 'text-red-400'} font-semibold`}>
                                    {statement.isTrue ? 'V' : 'F'}
                                  </span>
                                  <p className="text-sm flex-1">{statement.text}</p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => removeStatement(statement.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Opções de Resposta</Label>
                        {currentOptions.map((option, index) => (
                          <Input
                            key={index}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...currentOptions];
                              newOptions[index] = e.target.value;
                              setCurrentOptions(newOptions);
                            }}
                            placeholder={`Opção ${index + 1}`}
                            className="bg-muted/30 border-border/50"
                          />
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Label>Resposta Correta</Label>
                        <RadioGroup 
                          value={currentCorrectAnswer} 
                          onValueChange={setCurrentCorrectAnswer}
                        >
                          {currentOptions.filter(o => o.trim()).map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`correct-${index}`} />
                              <Label htmlFor={`correct-${index}`} className="cursor-pointer">{option}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </>
                  )}

                  <Button onClick={addQuestion} className="gap-2 bg-gradient-arcane hover:opacity-90">
                    <Plus className="w-4 h-4" />
                    Adicionar Pergunta
                  </Button>
                </div>
              </div>

              {questions.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-heading text-xl font-bold mb-4">
                    Perguntas ({questions.length})
                  </h3>
                  <div className="space-y-3">
                    {questions.map((q, index) => (
                      <Card key={q.id} className="p-4 bg-muted/30 border-border/50">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="font-semibold mb-2">{index + 1}. {q.text}</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>
                                Tipo: {q.type === "true-false" ? "Verdadeiro ou Falso" : "Múltipla escolha"}
                              </p>
                              {q.type === "true-false" && q.statements && (
                                <div className="mt-2 space-y-1">
                                  {q.statements.map((stmt, i) => (
                                    <p key={i} className="text-xs">
                                      <span className={stmt.isTrue ? 'text-green-400' : 'text-red-400'}>
                                        [{stmt.isTrue ? 'V' : 'F'}]
                                      </span> {stmt.text}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {q.type === "multiple" && (
                                <p>Resposta: {q.correctAnswer}</p>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeQuestion(q.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={createActivity}
                className="w-full bg-gradient-arcane hover:opacity-90 transition-opacity shadow-glow text-lg py-6"
              >
                Criar Atividade
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
              <h1 className="font-heading text-4xl font-bold text-gradient-arcane">Atividades</h1>
              <p className="text-muted-foreground mt-1">Gerenciar atividades dos alunos</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-gradient-arcane hover:opacity-90 transition-opacity gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Atividade
          </Button>
        </div>

        {activities.length === 0 ? (
          <Card className="p-12 text-center bg-card/80 backdrop-blur border-2 border-primary/20">
            <p className="text-muted-foreground text-lg mb-4">Nenhuma atividade criada ainda.</p>
            <Button onClick={() => setIsCreating(true)} className="bg-gradient-arcane shadow-glow">
              Criar Primeira Atividade
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="p-6 border-2 border-primary/30 bg-card/80 backdrop-blur hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-bold mb-2">{activity.title}</h3>
                    <p className="text-muted-foreground line-clamp-2 mb-3">{activity.text}</p>
                    <div className="flex gap-3 text-sm">
                      <span className="px-3 py-1 rounded-full bg-gradient-arcane text-white shadow-glow">
                        {activity.xpReward} XP
                      </span>
                      <span className="px-3 py-1 rounded-full bg-muted border border-border">
                        {activity.questions.length} perguntas
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteActivity(activity.id)}
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorAtividades;
