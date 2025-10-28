import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const powerData = {
  água: {
    emoji: "🌊",
    gradient: "bg-gradient-water",
    ranks: [
      { rank: "E", description: "Controla gotas, respingos e pode encher um copo d'água. (Básico, quase sem combate).", xpRequired: 0 },
      { rank: "D", description: "Cria pequenas ondas, manipula baldes de água, apaga fogueiras simples.", xpRequired: 50 },
      { rank: "C", description: "Forma jatos fortes e lâminas de água capazes de cortar madeira.", xpRequired: 150 },
      { rank: "B", description: "Molda escudos aquáticos, cria correntes para derrubar inimigos.", xpRequired: 300 },
      { rank: "A", description: "Invoca grandes ondas, pode respirar debaixo d'água por minutos.", xpRequired: 500 },
      { rank: "S", description: "Controla rios/lagos, cria formas aquáticas gigantes (serpentes, braços).", xpRequired: 800 },
      { rank: "SS", description: "Dobra mares, cria tempestades aquáticas, manipula gelo e vapor livremente.", xpRequired: 1200 }
    ]
  },
  fogo: {
    emoji: "🔥",
    gradient: "bg-gradient-fire",
    ranks: [
      { rank: "E", description: "Gera faíscas, acende velas, fogo de campinho.", xpRequired: 0 },
      { rank: "D", description: "Cria pequenas bolas de fogo, queima papel e madeira.", xpRequired: 50 },
      { rank: "C", description: "Rajadas de fogo, lança de chamas que causam queimaduras moderadas.", xpRequired: 150 },
      { rank: "B", description: "Explosões médias, muros de fogo, lança-chamas contínuos.", xpRequired: 300 },
      { rank: "A", description: "Meteoro de fogo, fogo azul (mais quente e denso), resistência a altas temperaturas.", xpRequired: 500 },
      { rank: "S", description: "Consegue incinerar grupos de inimigos, controlar fogo existente no ambiente.", xpRequired: 800 },
      { rank: "SS", description: "Invoca erupções, solta chamas que parecem um 'mini-sol', pode manipular magma.", xpRequired: 1200 }
    ]
  },
  terra: {
    emoji: "🌱",
    gradient: "bg-gradient-earth",
    ranks: [
      { rank: "E", description: "Move pedrinhas, endurece o solo.", xpRequired: 0 },
      { rank: "D", description: "Levanta pedras pequenas, cria muros baixos de terra.", xpRequired: 50 },
      { rank: "C", description: "Cria pilares, projéteis de rochas, paredes de proteção resistentes.", xpRequired: 150 },
      { rank: "B", description: "Abre fissuras no chão, ergue grandes muros, ataca com estacas de pedra.", xpRequired: 300 },
      { rank: "A", description: "Move grandes massas de terra, cria golems ou braços de pedra.", xpRequired: 500 },
      { rank: "S", description: "Controla montanhas médias, provoca mini-terremotos.", xpRequired: 800 },
      { rank: "SS", description: "Muda a paisagem inteira, controla minerais preciosos, terremotos devastadores.", xpRequired: 1200 }
    ]
  },
  ar: {
    emoji: "💨",
    gradient: "bg-gradient-air",
    ranks: [
      { rank: "E", description: "Levanta folhas, cria pequenas brisas.", xpRequired: 0 },
      { rank: "D", description: "Sopros fortes que empurram objetos leves, derruba velas.", xpRequired: 50 },
      { rank: "C", description: "Rajadas de vento que derrubam pessoas, manipula planadores ou objetos leves no ar.", xpRequired: 150 },
      { rank: "B", description: "Cria tornados pequenos, escudos de ar que desviam flechas.", xpRequired: 300 },
      { rank: "A", description: "Controla correntes de ar para voar por curtos períodos, cria ciclones locais.", xpRequired: 500 },
      { rank: "S", description: "Invoca tempestades, manipula trovões (não cria raios, mas canaliza).", xpRequired: 800 },
      { rank: "SS", description: "Cria furacões massivos, controla atmosfera, voa livremente sem limites.", xpRequired: 1200 }
    ]
  }
};

const Poderes = () => {
  const navigate = useNavigate();
  const [userElement, setUserElement] = useState<"água" | "terra" | "fogo" | "ar">("água");
  const [userRank, setUserRank] = useState("E");

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userData = users.find((u: any) => u.username === currentUser);
    
    if (!userData) {
      navigate("/");
      return;
    }

    setUserElement(userData.element);
    setUserRank(userData.rank);
  }, [navigate]);

  const elementData = powerData[userElement];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
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
            <h1 className="font-heading text-4xl font-bold text-gradient-arcane">
              Poderes do Elemento
            </h1>
            <p className="text-muted-foreground mt-1">Seu caminho elemental</p>
          </div>
        </div>

        {/* Element Header */}
        <Card className={`p-8 ${elementData.gradient} border-none text-white shadow-glow`}>
          <div className="text-center space-y-4">
            <div className="text-6xl">{elementData.emoji}</div>
            <h2 className="font-heading text-3xl font-bold capitalize">{userElement}</h2>
            <p className="text-lg opacity-90">Rank Atual: {userRank}</p>
          </div>
        </Card>

        {/* Ranks */}
        <div className="space-y-4">
          {elementData.ranks.map((rankData) => (
            <Card 
              key={rankData.rank}
              className={`p-6 border-2 transition-all ${
                rankData.rank === userRank 
                  ? `${elementData.gradient} text-white border-white shadow-glow` 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex gap-4">
                <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-heading text-2xl font-bold ${
                  rankData.rank === userRank 
                    ? "bg-white/20" 
                    : elementData.gradient + " text-white"
                }`}>
                  {rankData.rank}
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-bold mb-2">
                    Rank {rankData.rank}
                    {rankData.rank === userRank && " (Você está aqui)"}
                  </h3>
                  <p className={rankData.rank === userRank ? "opacity-90 mb-2" : "text-foreground mb-2"}>
                    {rankData.description}
                  </p>
                  <p className={`text-sm font-heading ${rankData.rank === userRank ? "opacity-80" : "text-muted-foreground"}`}>
                    {rankData.xpRequired === 0 ? "Inicial" : `Requer ${rankData.xpRequired} XP`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Poderes;
