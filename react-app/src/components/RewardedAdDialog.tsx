import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Play, X } from "lucide-react";
import { toast } from "sonner";

interface RewardedAdDialogProps {
  open: boolean;
  onWatchAd: () => void;
  onClaimXP: () => void;
  accumulatedXP: number;
}

export const RewardedAdDialog = ({
  open,
  onWatchAd,
  onClaimXP,
  accumulatedXP,
}: RewardedAdDialogProps) => {
  const handleWatchAd = () => {
    // Placeholder for Google AdMob rewarded ad
    toast.info("Loading rewarded ad...");

    // Simulate ad loading and watching
    setTimeout(() => {
      toast.success("Ad watched! +50 XP earned! Moving to next scene...");
      onWatchAd();
    }, 2000);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center mb-4">
            Mission Failed!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="w-10 h-10 text-destructive" />
            </div>
            <p className="text-muted-foreground mb-2">
              You didn't beat the bad citizens this time, but don't give up!
            </p>
          </div>

          <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Accumulated XP</span>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                <span className="text-2xl font-bold text-foreground">
                  {accumulatedXP} XP
                </span>
              </div>
            </div>

            <div className="bg-green-500/10 rounded-md p-3 mt-3 border border-green-500/30">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Watch ad to earn +50 XP bonus and continue to next scene!
              </p>
            </div>

            <p className="text-sm text-muted-foreground mt-3">
              Choose to continue playing or claim your current XP
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleWatchAd}
              className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              size="lg"
            >
              <Play className="w-5 h-5" />
              Watch Ad to Continue
            </Button>

            <Button
              onClick={onClaimXP}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Claim {accumulatedXP} XP and Exit
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Watch a short ad to earn bonus XP and continue your mission!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
