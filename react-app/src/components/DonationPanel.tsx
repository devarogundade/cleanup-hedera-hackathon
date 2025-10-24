import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, MapPin, Gamepad2, Sparkles } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useApp } from "@/contexts/AppContext";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import hbarLogo from "@/assets/hbar-logo.png";
import ngnLogo from "@/assets/ngn-logo.png";
import { RoundMetadata } from "@/types";
import { APP_CONFIG } from "@/data/constants";

interface DonationPanelProps {
  roundEnded: boolean;
  roundMetadata: RoundMetadata;
  onDonationComplete: () => void;
}

const DonationPanel = ({ roundEnded, roundMetadata }: DonationPanelProps) => {
  const navigate = useNavigate();
  const { playSound } = useSettings();
  const { mintableFractions, totalPrice, currency, setCurrency, accountId } = useApp();
  const { data: profile } = useProfile(accountId || "");
  const { data: userTransactions } = useTransactions(accountId || undefined);
  const hasNeverDonated = !userTransactions || userTransactions.length === 0;

  const getDisplayAmount = () => {
    if (currency === APP_CONFIG.HBAR_CURRENCY) {
      return totalPrice.toFixed(3);
    } else if (currency === APP_CONFIG.NGN_CURRENCY) {
      return (totalPrice * APP_CONFIG.NGN_TO_HBAR_RATE).toFixed(2);
    } else {
      // XP
      return (totalPrice * APP_CONFIG.HBAR_TO_XP_RATE).toFixed(0);
    }
  };

  const getUserBalance = () => {
    if (currency === APP_CONFIG.XP_CURRENCY) {
      return profile?.total_xp || 0;
    }
    return null;
  };

  const hasInsufficientBalance = () => {
    if (currency === APP_CONFIG.XP_CURRENCY) {
      const required = totalPrice * APP_CONFIG.HBAR_TO_XP_RATE;
      const balance = profile?.total_xp || 0;
      return balance < required;
    }
    return false;
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
    if (hasInsufficientBalance()) {
      toast({
        title: "Insufficient XP",
        description: `You need ${(totalPrice * APP_CONFIG.HBAR_TO_XP_RATE).toFixed(0)} XP but only have ${profile?.total_xp || 0} XP`,
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

          {/* Game Unlock Message */}
          {hasNeverDonated && (
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg animate-pulse">
              <div className="flex items-start gap-3">
                <Gamepad2 className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-1">🎮 Unlock Eco-Fighter Game!</p>
                  <p className="text-xs text-muted-foreground">
                    Make your first donation to unlock the endless mission-based game and start earning XP through gameplay!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Currency Selection */}
          <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs sm:text-sm font-medium mb-2">Currency</p>
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as "HBAR" | "NGN" | "XP")}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {currency === APP_CONFIG.XP_CURRENCY ? (
                      <>
                        <Sparkles className="w-5 h-5 text-accent" />
                        <span>XP</span>
                      </>
                    ) : (
                      <>
                        <img
                          src={
                            currency === APP_CONFIG.HBAR_CURRENCY
                              ? hbarLogo
                              : ngnLogo
                          }
                          alt={currency}
                          className="w-5 h-5"
                        />
                        <span>{currency}</span>
                      </>
                    )}
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
                <SelectItem value="XP">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <span>XP</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* XP Balance Display */}
            {currency === APP_CONFIG.XP_CURRENCY && (
              <div className="mt-2 flex items-center justify-between p-2 bg-accent/10 rounded border border-accent/20">
                <span className="text-xs text-muted-foreground">Your Balance:</span>
                <span className="text-sm font-bold text-accent">{getUserBalance()} XP</span>
              </div>
            )}
            
            {/* Conversion Rate Info */}
            {currency === APP_CONFIG.XP_CURRENCY && (
              <div className="mt-2 text-xs text-muted-foreground text-center">
                1 HBAR = {APP_CONFIG.HBAR_TO_XP_RATE} XP
              </div>
            )}
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
                {currency === APP_CONFIG.NGN_CURRENCY && (
                  <span className="text-xs text-muted-foreground">
                    ≈ {totalPrice.toFixed(3)} HBAR
                  </span>
                )}
                {currency === APP_CONFIG.XP_CURRENCY && (
                  <span className="text-xs text-muted-foreground">
                    ≈ {totalPrice.toFixed(3)} HBAR
                  </span>
                )}
                {hasInsufficientBalance() && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    Insufficient XP
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {mintableFractions.length > 0 && (
            <div className="mb-4 p-2 sm:p-3 bg-secondary rounded-lg">
              <p className="text-xs sm:text-sm text-center">
                🎁 You'll receive{" "}
                <span className="text-primary font-semibold">
                  {mintableFractions.length} NFT
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
          variant="ghost"
          className="w-full text-sm sm:text-base h-11 sm:h-12 font-semibold transition-all hover:scale-[1.02] bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white border-0 shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_35px_rgba(147,51,234,0.7)] animate-pulse disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={mintableFractions.length === 0 || roundEnded || hasInsufficientBalance()}
          onClick={handleDonateClick}
        >
          {roundEnded ? "Round Ended" : hasInsufficientBalance() ? "Insufficient XP" : "✨ Donate Now ✨"}
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
