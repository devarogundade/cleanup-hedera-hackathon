import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, MapPin } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import hbarLogo from "@/assets/hbar-logo.png";
import ngnLogo from "@/assets/ngn-logo.png";
import { RoundMetadata } from "@/types";

interface DonationPanelProps {
  roundEnded: boolean;
  roundMetadata: RoundMetadata;
  onDonationComplete: () => void;
}

const DonationPanel = ({ roundEnded, roundMetadata }: DonationPanelProps) => {
  const navigate = useNavigate();
  const { playSound } = useSettings();
  const {
    mintableFractions,
    totalPrice,
    currentRound: round,
    currency,
    setCurrency,
  } = useApp();

  // Conversion rate: 1 HBAR = ~400 NGN (approximate)
  const NGN_TO_HBAR_RATE = 400;

  const getDisplayAmount = () => {
    if (currency === "HBAR") {
      return totalPrice.toFixed(3);
    } else {
      return (totalPrice * NGN_TO_HBAR_RATE).toFixed(2);
    }
  };

  const handleDonateClick = () => {
    playSound("click");
    if (mintableFractions.length === 0) {
      toast({
        title: "No fractions selected",
        description: "Please select at least one fraction to donate",
        variant: "destructive",
      });
      playSound("error");
      return;
    }
    if (roundEnded) {
      toast({
        title: "Round has ended",
        description:
          "This cleanup round has already ended. Please select an active round.",
        variant: "destructive",
      });
      playSound("error");
      return;
    }

    // Navigate to donate page
    navigate(`/donate`);
  };

  return (
    <>
      <div className="space-y-4 sticky top-24 donation-panel">
        <Card className="bg-gradient-to-br from-card to-primary/5 border-0 p-4">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-1 text-primary">
              {roundMetadata?.type === "tree-planting"
                ? "🌳 Your Tree Planting Contribution"
                : "💚 Your Donation"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {roundMetadata?.type === "tree-planting"
                ? "Fund the restoration of nature"
                : "Every fraction makes a difference"}
            </p>
          </div>

          {/* Currency Selection */}
          <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs sm:text-sm font-medium mb-2">Currency</p>
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as "HBAR" | "NGN")}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <img
                      src={currency === "HBAR" ? hbarLogo : ngnLogo}
                      alt={currency}
                      className="w-5 h-5"
                    />
                    <span>{currency}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="HBAR">
                  <div className="flex items-center gap-2">
                    <img src={hbarLogo} alt="HBAR" className="w-5 h-5" />
                    <span>HBAR</span>
                  </div>
                </SelectItem>
                <SelectItem value="NGN">
                  <div className="flex items-center gap-2">
                    <img src={ngnLogo} alt="NGN" className="w-5 h-5" />
                    <span>NGN</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-primary/5 border border-primary/20 rounded-lg transition-all hover:bg-primary/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Selected Fractions
                </span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-primary">
                {mintableFractions.length}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 sm:p-3 bg-primary/10 border border-primary/30 rounded-lg transition-all hover:bg-primary/15">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Total Amount
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg sm:text-xl font-bold text-primary block">
                  {getDisplayAmount()} {currency}
                </span>
                {currency === "NGN" && (
                  <span className="text-xs text-muted-foreground">
                    ≈ {totalPrice.toFixed(3)} HBAR
                  </span>
                )}
              </div>
            </div>
          </div>

          {mintableFractions.length > 0 && (
            <div className="mb-4 p-2 sm:p-3 bg-secondary rounded-lg">
              <p className="text-xs sm:text-sm text-center">
                🎁 You'll receive{" "}
                <span className="text-primary font-semibold">
                  {mintableFractions} NFT
                  {mintableFractions.length !== 1 ? "s" : ""}
                </span>
              </p>
            </div>
          )}

          <div className="mt-4 space-y-1 text-xs sm:text-sm text-muted-foreground">
            <p>• NFTs minted after confirmation</p>
            <p>• Voting power scales with donation</p>
            <p>• Earn XP with every contribution</p>
          </div>
        </Card>

        <Button
          className="w-full text-sm sm:text-base h-11 sm:h-12 font-semibold transition-all hover:scale-[1.02] bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white border-0 shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_35px_rgba(147,51,234,0.7)] animate-pulse"
          disabled={mintableFractions.length === 0 || roundEnded}
          onClick={handleDonateClick}
        >
          {roundEnded ? "Round Ended" : "✨ Donate Now ✨"}
        </Button>

        {roundEnded && (
          <div className="text-center p-2 sm:p-3 bg-muted rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground">
              This cleanup round has ended. View current rounds to donate.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default DonationPanel;
