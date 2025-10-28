import * as React from "react";
import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard as KeyboardIcon } from "lucide-react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

export interface VirtualKeyboardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const VirtualKeyboardInput = forwardRef<HTMLInputElement, VirtualKeyboardInputProps>(
  ({ className, type, ...props }, ref) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleKeyPress = (button: string) => {
      if (button === "{enter}") {
        setIsDialogOpen(false);
      }
    };

    const handleChange = (input: string) => {
      if (props.onChange) {
        // Mimic a standard input event object
        const event = {
          target: { value: input }
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange(event);
      }
    };

    return (
      <div className="relative w-full">
        <Input
          type={type}
          className={`${className} pr-10`}
          ref={ref}
          readOnly // Prevents native keyboard from opening
          onClick={() => setIsDialogOpen(true)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 px-0"
          onClick={() => setIsDialogOpen(true)}
        >
          <KeyboardIcon className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Abrir teclado virtual</span>
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="p-2 border-none bg-transparent shadow-none max-w-4xl">
            <div className="bg-card/95 backdrop-blur-sm rounded-lg p-4 border-2 border-primary/30 shadow-card">
              <Keyboard
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                theme={"hg-theme-default hg-theme-dark my-keyboard"}
                layout={{
                  default: [
                    "' 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                    "{tab} q w e r t y u i o p [ ] \\",
                    "{lock} a s d f g h j k l ç ; ´ {enter}",
                    "{shift} z x c v b n m , . / {shift}",
                    "{space}",
                  ],
                  shift: [
                    "\" ! @ # $ % ¨ & * ( ) _ + {bksp}",
                    "{tab} Q W E R T Y U I O P { } |",
                    "{lock} A S D F G H J K L Ç : ` {enter}",
                    "{shift} Z X C V B N M < > ? {shift}",
                    "{space}",
                  ],
                }}
                display={{
                  "{bksp}": "⌫",
                  "{enter}": "↵ Entrar",
                  "{shift}": "⇧",
                  "{lock}": "⇪",
                  "{tab}": "⇥",
                  "{space}": " ",
                }}
                inputName={props.id || "virtual-input"}
                value={props.value as string}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);
VirtualKeyboardInput.displayName = "VirtualKeyboardInput";

export { VirtualKeyboardInput };