import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import wandinhaProfile from '@/assets/wandinha-profile.jpg';

interface WandinhaProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WandinhaProfile = ({ open, onOpenChange }: WandinhaProfileProps) => {
  const { user } = useUser();
  const [friendshipLevel, setFriendshipLevel] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      fetchFriendshipLevel();
    }
  }, [open, user]);

  const fetchFriendshipLevel = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('wandinha_friendship')
      .select('friendship_level')
      .eq('user_id', user.id)
      .maybeSingle();

    setFriendshipLevel(data?.friendship_level || 0);
    setLoading(false);
  };

  const getThought = () => {
    if (friendshipLevel === 0) {
      return "*olha com indiferença absoluta* Você é irrelevante para minha existência sombria.";
    } else if (friendshipLevel < 20) {
      return "*cruza os braços* Sua presença é tolerável... por enquanto.";
    } else if (friendshipLevel < 40) {
      return "*um leve aceno de cabeça* Você não é completamente tedioso.";
    } else if (friendshipLevel < 60) {
      return "*suspira* Admito que nossas conversas não são totalmente sem sentido.";
    } else if (friendshipLevel < 80) {
      return "*um quase sorriso desaparece* Você tem uma perspectiva interessante sobre a futilidade da vida.";
    } else {
      return "*inclina a cabeça sutilmente* Você é... tolerável. Talvez até digno de minha companhia em ocasiões específicas.";
    }
  };

  const getFriendshipStatus = () => {
    if (friendshipLevel === 0) return "Desconhecido";
    if (friendshipLevel < 20) return "Tolerável";
    if (friendshipLevel < 40) return "Conhecido";
    if (friendshipLevel < 60) return "Interessante";
    if (friendshipLevel < 80) return "Companheiro Sombrio";
    return "Aliado das Trevas";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-background via-background/95 to-muted border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-center">Wandinha Addams</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          <Avatar className="w-32 h-32 border-4 border-primary/50">
            <AvatarImage src={wandinhaProfile} />
            <AvatarFallback>💨</AvatarFallback>
          </Avatar>

          <div className="w-full space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Nível de Amizade</p>
              <p className="text-2xl font-bold text-primary">{getFriendshipStatus()}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="text-foreground font-semibold">{friendshipLevel}/100</span>
              </div>
              <Progress value={friendshipLevel} className="h-3" />
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-2 font-semibold">O que ela pensa de você:</p>
              {loading ? (
                <p className="text-sm italic">Carregando...</p>
              ) : (
                <p className="text-sm italic text-foreground leading-relaxed">{getThought()}</p>
              )}
            </div>

            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>💡 Dica: Responda às mensagens dela para aumentar a amizade</p>
              <p className="text-primary">Elemento: AR • Rank: C • 250 XP</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WandinhaProfile;
