import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
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

const Aulas = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | Record<string, boolean>>>({});
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const userType = localStorage.getItem("userType");
    
    if (!currentUser || userType !== "student") {
      navigate("/");
      return;
    }

    setUsername(currentUser);

    // Load activities
    const storedActivities = JSON.parse(localStorage.getItem("activities") || "[]");
    setActivities(storedActivities);

    // Load completed activities for this user
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userData = users.find((u: any) => u.username === currentUser);
    setCompletedActivities(userData?.completedActivities || []);
  }, [navigate]);

  const handleSubmit = () => {
    if (!selectedActivity) return;

    // Check if all questions are answered
    const allAnswered = selectedActivity.questions.every(q => answers[q.id]);
    if (!allAnswered) {
      toast.error("Por favor, responda todas as perguntas");
      return;
    }

    // Calculate score
    let correctCount = 0;
    selectedActivity.questions.forEach(q => {
      if (q.type === "multiple" && answers[q.id] === q.correctAnswer) {
        correctCount++;
      } else if (q.type === "true-false" && q.statements) {
        const userAnswers = answers[q.id] as Record<string, boolean>;
        const allCorrect = q.statements.every(stmt => userAnswers?.[stmt.id] === stmt.isTrue);
        if (allCorrect) correctCount++;
      }
    });

    const score = (correctCount / selectedActivity.questions.length) * 100;

    // Update user data
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: any) => u.username === username);
    
    if (userIndex !== -1) {
      if (!users[userIndex].completedActivities.includes(selectedActivity.id)) {
        users[userIndex].completedActivities.push(selectedActivity.id);
        users[userIndex].xp += selectedActivity.xpReward;
        localStorage.setItem("users", JSON.stringify(users));
        setCompletedActivities([...completedActivities, selectedActivity.id]);
      }
    }

    toast.success(`Pontuação: ${score.toFixed(0)}%! Você ganhou ${selectedActivity.xpReward} XP!`);
    setSelectedActivity(null);
    setAnswers({});
  };

  if (selectedActivity) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedActivity(null);
              setAnswers({});
            }}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <Card className="p-8 shadow-card border-2 border-primary/30 bg-card/80 backdrop-blur">
            <h2 className="font-heading text-3xl font-bold mb-6 text-gradient-arcane">
              {selectedActivity.title}
            </h2>
            
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-foreground whitespace-pre-wrap">{selectedActivity.text}</p>
            </div>

            <div className="space-y-6">
              {selectedActivity.questions.map((question, index) => (
                <Card key={question.id} className="p-6 bg-muted/30">
                  <h3 className="font-heading text-lg font-semibold mb-4">
                    {index + 1}. {question.text}
                  </h3>
                  
                  {question.type === "true-false" && question.statements ? (
                    <div className="space-y-3">
                      {question.statements.map((stmt) => (
                        <div key={stmt.id} className="p-3 rounded-lg bg-background/50 border border-border/50">
                          <p className="mb-2 text-sm">{stmt.text}</p>
                          <RadioGroup 
                            value={((answers[question.id] as Record<string, boolean>)?.[stmt.id])?.toString()} 
                            onValueChange={(value) => {
                              const currentAnswers = (answers[question.id] as Record<string, boolean>) || {};
                              setAnswers({
                                ...answers, 
                                [question.id]: {...currentAnswers, [stmt.id]: value === "true"}
                              });
                            }}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id={`${stmt.id}-true`} />
                              <Label htmlFor={`${stmt.id}-true`} className="cursor-pointer text-sm">Verdadeiro</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id={`${stmt.id}-false`} />
                              <Label htmlFor={`${stmt.id}-false`} className="cursor-pointer text-sm">Falso</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <RadioGroup 
                      value={answers[question.id] as string} 
                      onValueChange={(value) => setAnswers({...answers, [question.id]: value})}
                    >
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} />
                          <Label htmlFor={`${question.id}-${optIndex}`} className="cursor-pointer">{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </Card>
              ))}
            </div>

            <Button 
              onClick={handleSubmit}
              className="w-full mt-8 bg-gradient-arcane hover:opacity-90 transition-opacity shadow-glow text-lg py-6"
            >
              Enviar Respostas
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="font-heading text-4xl font-bold text-gradient-arcane">Aulas</h1>
            <p className="text-muted-foreground mt-1">Complete as atividades e ganhe XP</p>
          </div>
        </div>

        {activities.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">Nenhuma atividade disponível no momento.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const isCompleted = completedActivities.includes(activity.id);
              
              return (
                <Card 
                  key={activity.id}
                  className={`p-6 cursor-pointer transition-all border-2 bg-card/80 backdrop-blur ${
                    isCompleted 
                      ? "border-green-500/50 bg-green-950/30" 
                      : "border-primary/30 hover:border-primary/50 hover:shadow-glow"
                  }`}
                  onClick={() => !isCompleted && setSelectedActivity(activity)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-heading text-xl font-bold mb-2">{activity.title}</h3>
                      <p className="text-muted-foreground line-clamp-2 mb-3">{activity.text}</p>
                      <div className="flex gap-3 text-sm">
                        <span className="px-3 py-1 rounded-full bg-gradient-arcane text-white">
                          {activity.xpReward} XP
                        </span>
                        <span className="px-3 py-1 rounded-full bg-muted">
                          {activity.questions.length} {activity.questions.length === 1 ? "pergunta" : "perguntas"}
                        </span>
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                    )}
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

export default Aulas;
