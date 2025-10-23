import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettings } from "@/contexts/SettingsContext";

const SoundToggle = () => {
  const { soundEnabled, toggleSound, playSound } = useSettings();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              toggleSound();
              playSound('click');
            }}
            className="rounded-full"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{soundEnabled ? 'Disable' : 'Enable'} click sounds</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SoundToggle;
