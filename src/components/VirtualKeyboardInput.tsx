import * as React from "react";
import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Keyboard as KeyboardIcon } from "lucide-react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface VirtualKeyboardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const VirtualKeyboardInput = forwardRef<HTMLInputElement, VirtualKeyboardInputProps>(
  ({ className, type, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile();

    const handleKeyPress = (button: string) => {
      if (button === "{enter}") {
        setIsOpen(false);
      }
    };

    const handleChange = (input: string) => {
      if (props.onChange) {
        const event = {
          target: { value: input }
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange(event);
      }
    };

    const KeyboardContent = (
      <div className="bg-card/95 backdrop-blur-sm p-2 sm:p-4">
        <div className="w-full bg-input rounded-md p-3 mb-4 text-lg font-serif text-left min-h-[52px] break-words">
          {props.value || <span className="text-muted-foreground">{props.placeholder}</span>}
        </div>
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
    );

    const trigger = (
      <div className="relative w-full">
        <Input
          type={type}
          className={cn("pr-10", className)}
          ref={ref}
          readOnly
          onClick={() => setIsOpen(true)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 px-0"
          onClick={() => setIsOpen(true)}
        >
          <KeyboardIcon className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Abrir teclado virtual</span>
        </Button>
      </div>
    );

    if (isMobile) {
      return (
        <>
          {trigger}
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent className="bg-transparent border-none p-0">
              <div className="bg-card/95 backdrop-blur-sm rounded-t-lg p-4 border-t-2 border-primary/30">
                {KeyboardContent}
              </div>
            </DrawerContent>
          </Drawer>
        </>
      );
    }

    return (
      <>
        {trigger}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-4xl">
            <div className="bg-card/95 backdrop-blur-sm rounded-lg p-4 border-2 border-primary/30 shadow-card">
              {KeyboardContent}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);
VirtualKeyboardInput.displayName = "VirtualKeyboardInput";

export { VirtualKeyboardInput };