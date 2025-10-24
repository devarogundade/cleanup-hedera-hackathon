import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, Trophy, Zap } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useApp } from "@/contexts/AppContext";
import { ROUTES } from "@/data/constants";

const GameSection = () => {
  const navigate = useNavigate();
  const { playSound } = useSettings();
  const { currentRound } = useApp();

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30  mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gaming-accent/20 rounded-xl">
              <Gamepad2 className="w-8 h-8 text-gaming-accent" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gradient-gaming">
              Round {currentRound} Challenge
            </h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Race against AI to collect trash and earn bonus XP! Choose your
            difficulty level and compete for the top score.
          </p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              <span>Win rewards</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Earn XP</span>
            </div>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-gaming-accent" />
              <span>3 Difficulty Levels</span>
            </div>
          </div>
        </div>
        <Button
          size="lg"
          className="gap-2 min-w-[200px] h-14 text-lg font-bold bg-gradient-to-r from-gaming-accent via-accent to-gaming-accent bg-size-200 animate-gradient hover:scale-105 transition-transform shadow-gaming"
          onClick={() => {
            playSound("click");
            navigate(ROUTES.GAME_PLAY(currentRound));
          }}
        >
          <Gamepad2 className="w-6 h-6" />
          Play Now
        </Button>
      </div>
    </Card>
  );
};

export default GameSection;
