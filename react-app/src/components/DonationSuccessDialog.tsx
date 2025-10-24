import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Gift, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import hbarLogo from "@/assets/hbar-logo.png";
import ngnLogo from "@/assets/ngn-logo.png";
import { APP_CONFIG } from "@/data/constants";

interface DonationSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mintableFractions: number;
  totalPrice: number;
  currency: "HBAR" | "NGN" | "XP";
  ngoName: string;
  roundType?: string;
  transactionId?: string;
  xpEarned?: number;
}

const DonationSuccessDialog = ({
  open,
  onOpenChange,
  mintableFractions,
  totalPrice,
  currency,
  ngoName,
  roundType = "cleanup",
  transactionId,
  xpEarned,
}: DonationSuccessDialogProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const getDisplayAmount = () => {
    if (currency === APP_CONFIG.HBAR_CURRENCY) {
      return totalPrice.toFixed(3);
    } else if (currency === APP_CONFIG.XP_CURRENCY) {
      return (totalPrice * APP_CONFIG.HBAR_TO_XP_RATE).toFixed(0);
    } else {
      return (totalPrice * APP_CONFIG.NGN_TO_HBAR_RATE).toFixed(2);
    }
  };

  const handleShareOnX = () => {
    const roundTypeText =
      roundType === "tree-planting"
        ? "tree planting"
        : roundType === "ocean-cleanup"
        ? "ocean cleanup"
        : "waste cleanup";

    const tweetText = `I just donated ${getDisplayAmount()} ${currency} to support ${roundTypeText} with @CleanUpDAO! 🌍\n\nJoined the eco-warrior movement and minted ${mintableFractions} NFT${
      mintableFractions > 1 ? "s" : ""
    } on @hedera 💚\n\nSupporting ${ngoName}\n\n#CleanUpDAO #Hedera #ClimateAction`;

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}`;
    window.open(tweetUrl, "_blank");
  };

  const currencyLogo =
    currency === APP_CONFIG.HBAR_CURRENCY
      ? hbarLogo
      : currency === APP_CONFIG.XP_CURRENCY
      ? null
      : ngnLogo;

  useEffect(() => {
    if (!open) {
      setShowConfetti(false);
      return;
    }

    if (showConfetti) return;

    setShowConfetti(true);

    // Trigger confetti with cleanup
    const duration = 3000;
    const end = Date.now() + duration;
    let frameId: number;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#10b981", "#3b82f6", "#8b5cf6"],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#10b981", "#3b82f6", "#8b5cf6"],
      });

      if (Date.now() < end) {
        frameId = requestAnimationFrame(frame);
      }
    };

    frame();

    // Cleanup function to cancel animation frame
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [open, showConfetti]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <CheckCircle2 className="w-20 h-20 text-primary relative animate-scale-in" />
            </div>
          </div>
          <DialogTitle className="text-center text-3xl">
            Donation Successful! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Thank you for supporting our cleanup efforts!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          <div className="bg-gradient-primary/10 border border-primary/30 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount Donated</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gradient flex items-center gap-2 justify-end">
                  {currencyLogo ? (
                    <img
                      src={currencyLogo}
                      alt={currency}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <Sparkles className="w-6 h-6 text-accent" />
                  )}
                  {getDisplayAmount()} {currency}
                </span>
                {currency === APP_CONFIG.NGN_CURRENCY && (
                  <span className="text-sm text-muted-foreground">
                    ≈ {totalPrice.toFixed(3)} HBAR
                  </span>
                )}
                {currency === APP_CONFIG.XP_CURRENCY && (
                  <span className="text-sm text-muted-foreground">
                    ≈ {totalPrice.toFixed(3)} HBAR
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">NFTs Minting</span>
              <span className="text-xl font-bold flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                {mintableFractions}
              </span>
            </div>

            {xpEarned && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">XP Earned</span>
                <span className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  {xpEarned}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Supporting NGO</span>
              <span className="font-semibold">{ngoName}</span>
            </div>
          </div>

          <div className="bg-secondary/10 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">What's Next?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your NFTs will be minted on the blockchain</li>
                  <li>• You'll receive them in your wallet shortly</li>
                  <li>• Your vote has been recorded for {ngoName}</li>
                  <li>• Track your impact in transaction history</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-gradient-primary border-0 shadow-[0_8px_24px_hsl(220_10%_50%_/_0.2)] gap-2"
            onClick={handleShareOnX}
          >
            <Share2 className="w-4 h-4" />
            Share on X
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                const hash = transactionId || "mock";
                window.open(
                  `https://hashscan.io/testnet/transaction/${hash}`,
                  "_blank"
                );
              }}
            >
              View on HashScan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationSuccessDialog;
