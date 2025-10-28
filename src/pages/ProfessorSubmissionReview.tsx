import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ProfessorSubmissionReview = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { user: professorUser } = useUser();
  const [submission, setSubmission] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number | string>('');

  useEffect(() => {
    if (!professorUser?.isProfessor) {
      navigate('/');
    }
  }, [professorUser, navigate]);

  useEffect(() => {
    const fetchSubmissionData = async () => {
      if (!submissionId) return;
      setLoading(true);

      const { data: submissionData, error: submissionError } = await supabase
        .from('activity_submissions')
        .select('*, users(*), activities(*)')
        .eq('id', submissionId)
        .single();

      if (submissionError || !submissionData) {
        toast.error('Erro ao carregar submissão.');
        console.error(submissionError);
        setLoading(false);
        return;
      }

      setSubmission(submissionData);
      setStudent(submissionData.users);
      setActivity(submissionData.activities);
      setScore(submissionData.score ?? '');
      setLoading(false);
    };

    fetchSubmissionData();
  }, [submissionId]);

  const handleSubmitGrade = async () => {
    if (score === '' || Number(score) < 0 || Number(score) > 10) {
      toast.error('Por favor, insira uma nota de 0 a 10.');
      return;
    }

    // Update submission
    const { error: submissionError } = await supabase
      .from('activity_submissions')
      .update({
        status: 'graded',
        score: Number(score),
        graded_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (submissionError) {
      toast.error('Erro ao salvar a nota.');
      console.error(submissionError);
      return;
    }

    // Grant XP if score is 5 or higher
    if (Number(score) >= 5) {
      const { error: rpcError } = await supabase.rpc('add_xp', {
        user_id_param: student.id,
        xp_to_add: activity.xp_reward,
      });

      if (rpcError) {
        toast.error('Erro ao conceder XP.');
        console.error(rpcError);
        return;
      }
    }

    toast.success('Atividade corrigida com sucesso!');
    navigate('/professor/atividades');
  };

  if (loading) {
    return <div className="min-h-screen p-8 text-center">Carregando...</div>;
  }

  if (!submission || !activity || !student) {
    return <div className="min-h-screen p-8 text-center">Submissão não encontrada.</div>;
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/professor/atividades')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <Card className="p-8 shadow-card border-2 border-primary/30">
          <h1 className="font-heading text-3xl font-bold mb-2 text-gradient-arcane">{activity.title}</h1>
          <p className="text-muted-foreground mb-6">Revisão da submissão de <span className="font-bold text-secondary">{student.name}</span></p>

          {activity.questions.map((q: any, index: number) => (
            <Card key={q.id} className="p-6 mb-4 bg-muted/30">
              <h3 className="font-heading text-lg font-semibold mb-4">{index + 1}. {q.text}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student's Answer */}
                <div>
                  <Label className="font-bold text-secondary">Resposta do Aluno</Label>
                  <div className="mt-2 p-4 rounded-lg bg-background/50 border border-border/50 min-h-[80px]">
                    {q.type === 'multiple' && <p>{submission.answers[q.id]}</p>}
                    {q.type === 'true-false' && q.statements.map((stmt: any) => {
                      const studentAnswer = submission.answers[q.id]?.[stmt.id];
                      return (
                        <p key={stmt.id} className="text-sm">
                          <span className={studentAnswer ? 'text-green-400' : 'text-red-400'}>
                            [{studentAnswer ? 'V' : 'F'}]
                          </span> {stmt.text}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* Correct Answer */}
                <div>
                  <Label className="font-bold text-green-400">Resposta Correta</Label>
                  <div className="mt-2 p-4 rounded-lg bg-background/50 border border-border/50 min-h-[80px]">
                    {q.type === 'multiple' && <p>{q.correctAnswer}</p>}
                    {q.type === 'true-false' && q.statements.map((stmt: any) => (
                      <p key={stmt.id} className="text-sm">
                        <span className={stmt.isTrue ? 'text-green-400' : 'text-red-400'}>
                          [{stmt.isTrue ? 'V' : 'F'}]
                        </span> {stmt.text}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="font-heading text-xl font-bold mb-4">Correção</h3>
            <div className="flex items-end gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="score">Nota (0 a 10)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="10"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="text-lg"
                  disabled={submission.status === 'graded'}
                />
              </div>
              <Button
                onClick={handleSubmitGrade}
                className="bg-gradient-arcane hover:opacity-90 shadow-glow text-lg py-6 px-8"
                disabled={submission.status === 'graded'}
              >
                {submission.status === 'graded' ? 'Corrigido' : 'Salvar e Conceder XP'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Alunos com nota 5 ou superior receberão o XP da atividade.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfessorSubmissionReview;