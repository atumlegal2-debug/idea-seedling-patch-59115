import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Delete, Keyboard, CornerDownLeft } from "lucide-react";

interface VirtualKeyboardProps {
  onType: (value: string) => void;
  value: string;
  placeholder?: string;
}

const VirtualKeyboard = ({ onType, value, placeholder }: VirtualKeyboardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpperCase, setIsUpperCase] = useState(false);

  const keys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const specialKeys = [',', '.', '?', '!', '-', '@', '#', '*', '(', ')', '_', '+', '=', '/'];

  const handleKeyPress = (key: string) => {
    const char = isUpperCase ? key.toUpperCase() : key.toLowerCase();
    onType(value + char);
  };

  const handleBackspace = () => {
    onType(value.slice(0, -1));
  };

  const handleSpace = () => {
    onType(value + ' ');
  };

  const handleEnter = () => {
    onType(value + '\n');
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 items-center">
        <div className="flex-1 px-3 py-2.5 rounded-lg border-2 border-input bg-background/80 backdrop-blur text-foreground min-h-11 flex items-center overflow-x-auto transition-all hover:border-primary/50">
          {value || <span className="text-muted-foreground">{placeholder}</span>}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={`shrink-0 h-11 w-11 transition-all shadow-md ${isOpen ? 'bg-gradient-arcane text-white border-primary shadow-glow' : 'hover:border-primary/50'}`}
        >
          <Keyboard className="w-5 h-5" />
        </Button>
      </div>

      {isOpen && (
        <div className="pt-4 animate-fade-in">
            <div className="bg-gradient-to-b from-card/95 via-card to-card/98 backdrop-blur-xl border-t-4 border-primary/40 shadow-[0_-10px_50px_-10px_rgba(168,85,247,0.4)] p-2 sm:p-4 rounded-lg">
              {/* Header */}
              <div className="flex justify-between items-center mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-arcane animate-pulse" />
                  <span className="text-sm font-heading text-gradient-arcane font-bold">Teclado Mágico</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Keys */}
              <div className="space-y-1.5 max-w-2xl mx-auto">
                {/* Number row */}
                <div className="flex gap-1 justify-center">
                  {keys[0].map((key) => (
                    <Button
                      key={key}
                      type="button"
                      variant="outline"
                      onClick={() => handleKeyPress(key)}
                      className="h-11 flex-1 p-1 min-w-0 font-heading text-sm bg-gradient-to-b from-background/80 to-background/60 hover:from-primary/20 hover:to-primary/10 border-border/50 hover:border-primary/50 active:scale-95 transition-all shadow-sm"
                    >
                      {key}
                    </Button>
                  ))}
                </div>
                
                {/* Letter rows */}
                {keys.slice(1).map((row, i) => (
                  <div key={i} className="flex gap-1 justify-center">
                    {row.map((key) => (
                      <Button
                        key={key}
                        type="button"
                        variant="outline"
                        onClick={() => handleKeyPress(key)}
                        className="h-12 flex-1 p-1 min-w-0 font-heading text-sm bg-gradient-to-b from-background/80 to-background/60 hover:from-primary/20 hover:to-primary/10 border-border/50 hover:border-primary/50 active:scale-95 transition-all shadow-sm"
                      >
                        {isUpperCase ? key.toUpperCase() : key.toLowerCase()}
                      </Button>
                    ))}
                  </div>
                ))}
                
                {/* Special characters */}
                <div className="flex gap-1 justify-center flex-wrap pt-1">
                  {specialKeys.map((key) => (
                    <Button
                      key={key}
                      type="button"
                      variant="outline"
                      onClick={() => onType(value + key)}
                      className="h-10 px-2.5 font-heading bg-gradient-to-b from-background/70 to-background/50 hover:from-secondary/20 hover:to-secondary/10 border-border/50 hover:border-secondary/50 active:scale-95 transition-all shadow-sm"
                    >
                      {key}
                    </Button>
                  ))}
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUpperCase(!isUpperCase)}
                    className={`h-12 px-3 font-heading transition-all shadow-sm ${
                      isUpperCase 
                        ? 'bg-gradient-arcane text-white border-primary shadow-glow' 
                        : 'bg-gradient-to-b from-background/80 to-background/60 hover:from-primary/20 hover:to-primary/10 border-border/50'
                    }`}
                  >
                    {isUpperCase ? 'ABC' : 'abc'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSpace}
                    className="h-12 flex-1 font-heading bg-gradient-to-b from-background/80 to-background/60 hover:from-primary/20 hover:to-primary/10 border-border/50 hover:border-primary/50 active:scale-[0.98] transition-all shadow-sm"
                  >
                    Espaço
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackspace}
                    className="h-12 px-3 font-heading gap-1 bg-gradient-to-b from-background/70 to-background/50 hover:from-destructive/20 hover:to-destructive/10 border-border/50 hover:border-destructive/50 active:scale-95 transition-all shadow-sm"
                  >
                    <Delete className="w-4 h-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEnter}
                    className="h-12 px-3 font-heading bg-gradient-to-b from-background/80 to-background/60 hover:from-primary/20 hover:to-primary/10 border-border/50 hover:border-primary/50 active:scale-95 transition-all shadow-sm"
                  >
                    <CornerDownLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default VirtualKeyboard;