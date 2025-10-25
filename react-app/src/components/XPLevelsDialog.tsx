import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Lock, Trophy, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { XP_LEVELS } from "@/data/constants";

interface XPLevelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLevel: number;
  currentXP: number;
}

const XPLevelsDialog = ({
  open,
  onOpenChange,
  currentLevel,
  currentXP,
}: XPLevelsDialogProps) => {
  const getTotalXP = () => {
    const levelIndex = XP_LEVELS.findIndex((l) => l.level === currentLevel);
    if (levelIndex === -1) return currentXP;
    const baseXP = levelIndex > 0 ? XP_LEVELS[levelIndex].xpRequired : 0;
    return baseXP + currentXP;
  };

  const isLevelUnlocked = (level: number) => level <= currentLevel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-primary" />
            XP Levels & Rewards
          </DialogTitle>
          <DialogDescription>
            Progress through levels to unlock exclusive rewards and benefits
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-4 bg-gradient-primary/10 border border-primary/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Level</p>
              <p className="text-2xl font-bold text-gradient">
                Level {currentLevel}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total XP</p>
              <p className="text-xl font-bold">{getTotalXP()} XP</p>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {XP_LEVELS.map((level) => {
              const unlocked = isLevelUnlocked(level.level);
              const isCurrent = level.level === currentLevel;

              return (
                <div
                  key={level.level}
                  className={`relative p-4 rounded-lg border transition-all ${
                    unlocked
                      ? isCurrent
                        ? "bg-primary/10 border-primary shadow-[0_4px_16px_hsl(220_10%_50%_/_0.15)]"
                        : "bg-card border-primary/30"
                      : "bg-muted/50 border-muted opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Level Icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        unlocked
                          ? "bg-gradient-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {unlocked ? (
                        isCurrent ? (
                          <span className="text-xl font-bold">
                            {level.level}
                          </span>
                        ) : (
                          <Check className="w-6 h-6" />
                        )
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    {/* Level Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">{level.title}</h4>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {unlocked && !isCurrent && (
                          <Badge
                            variant="outline"
                            className="text-xs border-primary/50"
                          >
                            Unlocked
                          </Badge>
                        )}
                        {!unlocked && (
                          <Badge variant="secondary" className="text-xs">
                            Locked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {unlocked
                          ? "Level Achieved!"
                          : `Requires ${level.xpRequired} XP`}
                      </p>

                      {/* Rewards */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Rewards:
                        </p>
                        <ul className="space-y-1">
                          {level.rewards.map((reward, idx) => (
                            <li
                              key={idx}
                              className={`text-sm flex items-center gap-2 ${
                                unlocked
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              {reward}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar for current level */}
                  {isCurrent && (
                    <div className="mt-3 pt-3 border-t border-primary/20">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Progress to Next Level
                        </span>
                        <span className="font-semibold">
                          {currentXP} /{" "}
                          {XP_LEVELS[level.level]?.xpRequired || "MAX"}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary transition-all"
                          style={{
                            width: `${
                              XP_LEVELS[level.level]
                                ? (currentXP /
                                    XP_LEVELS[level.level].xpRequired) *
                                  100
                                : 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default XPLevelsDialog;
