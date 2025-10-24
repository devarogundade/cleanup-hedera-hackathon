import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TypingText } from "./TypingText";
import { LogOut } from "lucide-react";

interface InstructorDialogProps {
  open: boolean;
  instructions: string[];
  sceneNumber: number;
  onComplete: () => void;
  onExit?: () => void;
}

export const InstructorDialog = ({ 
  open, 
  instructions, 
  sceneNumber,
  onComplete,
  onExit
}: InstructorDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setCanContinue(false);
    }
  }, [open]);

  const handleContinue = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
      setCanContinue(false);
    } else {
      onComplete();
    }
  };

  const handleTypingComplete = () => {
    setCanContinue(true);
  };

  const handleClose = () => {
    if (onExit) {
      onExit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-background to-primary/5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
              👨‍🏫
            </div>
            <div>
              <div className="text-xl font-bold">Mission Briefing</div>
              <Badge variant="secondary" className="mt-1">
                Scene #{sceneNumber}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <div className="min-h-[120px] p-6 bg-muted/50 rounded-lg border border-border">
            <TypingText
              key={currentStep}
              text={instructions[currentStep]}
              speed={30}
              onComplete={handleTypingComplete}
              className="text-lg text-foreground leading-relaxed"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline">
              Step {currentStep + 1} of {instructions.length}
            </Badge>
            {onExit && (
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit
              </Button>
            )}
          </div>
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent"
          >
            {currentStep < instructions.length - 1 ? "Continue" : "Start Mission"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
