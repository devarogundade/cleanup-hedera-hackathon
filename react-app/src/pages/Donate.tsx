/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ExternalLink,
  Vote,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/contexts/SettingsContext";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";
import hbarLogo from "@/assets/hbar-logo.png";
import ngnLogo from "@/assets/ngn-logo.png";
import DonationSuccessDialog from "@/components/DonationSuccessDialog";
import { Link } from "react-router-dom";
import { useNGOs, useNGOVotes } from "@/hooks/useNGOs";
import { LoadingState, StatsLoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useRound } from "@/hooks/useRounds";
import { useDonation } from "@/hooks/useDonations";
import useHashConnect from "@/hooks/useHashConnect";

const Donate = () => {
  const navigate = useNavigate();
  const { playSound } = useSettings();
  const {
    selectedFractions,
    totalPrice,
    currency,
    currentRound,
    selectedNGO: contextSelectedNGO,
    resetDonationState,
  } = useApp();

  const { accountId } = useHashConnect();
  const { data: roundMetadata } = useRound(currentRound);
  // No need to fetch fractions here since we already have donatedFractionIds from context

  const [selectedNGO, setSelectedNGO] = useState<string>(
    contextSelectedNGO ? contextSelectedNGO.toString() : ""
  );
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [transactionData, setTransactionData] = useState<any>(null);

  const donationMutation = useDonation();

  const NGN_TO_HBAR_RATE = 400;

  // Calculate voting power: 1 HBAR = 100 votes
  const votingPower = Math.floor(totalPrice * 100);

  const getDisplayAmount = () => {
    if (currency === "HBAR") {
      return totalPrice.toFixed(3);
    } else {
      return (totalPrice * NGN_TO_HBAR_RATE).toFixed(2);
    }
  };

  const currencyLogo = currency === "HBAR" ? hbarLogo : ngnLogo;

  const { data: ngos, isLoading: ngosLoading } = useNGOs();
  const { data: votesByNgo, isLoading: votesLoading } =
    useNGOVotes(currentRound);

  const ngosWithVotes =
    ngos?.map((ngo) => ({
      ...ngo,
      votes: votesByNgo?.[ngo.id] || 0,
    })) || [];

  const totalVotes = ngosWithVotes.reduce((sum, ngo) => sum + ngo.votes, 0);
  const selectedNGOData = ngosWithVotes.find(
    (n) => n.id === parseInt(selectedNGO)
  );

  // Calculate updated votes for selected NGO
  const getUpdatedVotes = (ngoId: number) => {
    const ngo = ngosWithVotes.find((n) => n.id === ngoId);
    if (!ngo) return 0;
    return selectedNGO === String(ngoId) ? ngo.votes + votingPower : ngo.votes;
  };

  const getUpdatedPercentage = (ngoId: number) => {
    const updatedTotal = selectedNGO ? totalVotes + votingPower : totalVotes;
    return updatedTotal > 0 ? (getUpdatedVotes(ngoId) / updatedTotal) * 100 : 0;
  };

  const handleConfirm = async () => {
    if (!selectedNGO) {
      toast({
        title: "Please select an NGO",
        description: "You must choose an NGO to continue with your donation",
        variant: "destructive",
      });
      playSound("error");
      return;
    }

    if (!accountId) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your HashPack wallet first",
        variant: "destructive",
      });
      return;
    }

    if (selectedFractions.length === 0) {
      toast({
        title: "No fractions selected",
        description: "Please select fractions to donate",
        variant: "destructive",
      });
      return;
    }

    const ngo = ngosWithVotes.find((n) => n.id === parseInt(selectedNGO));

    try {
      const result = await donationMutation.mutateAsync({
        params: {
          accountId,
          roundId: currentRound,
          fractionIds: selectedFractions,
          ngoId: parseInt(selectedNGO),
          amount: totalPrice,
          currency,
          votingPower,
          message: `Donated ${selectedFractions} fractions to ${ngo?.name}`,
        },
        onProgress: (step) => {
          setProcessingStep(step.message);
        },
      });

      setTransactionData(result);
      setShowSuccessDialog(true);
      playSound("success");
    } catch (error) {
      playSound("error");
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    resetDonationState();
    // Force a full page refresh to update all round data
    window.location.href = `/app/${currentRound}`;
  };

  if (selectedFractions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
            No Fractions Selected
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Please select fractions from the map before proceeding to donate.
          </p>
          <Link to={`/app`}>
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Round
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (ngosLoading || votesLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-lg sm:text-xl font-bold">🌱</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-foreground">
                CleanUp
              </span>
            </Link>
            <Link to={`/app`}>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Round
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
              Complete Your Donation
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Vote for an NGO to handle the cleanup and confirm your
              contribution
            </p>
          </div>

          {/* Donation Summary Card */}
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                  Your Donation
                </div>
                <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center sm:justify-start gap-2 text-foreground">
                  <img
                    src={currencyLogo}
                    alt={currency}
                    className="w-6 h-6 sm:w-8 sm:h-8"
                  />
                  {getDisplayAmount()} {currency}
                </div>
                {currency === "NGN" && (
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    ≈ {totalPrice.toFixed(3)} HBAR
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                  Voting Power
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                    <Vote className="w-6 h-6 sm:w-7 sm:h-7" />
                    {votingPower.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    votes
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Contributing
                </div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {selectedFractions.length} fractions
                </div>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {selectedFractions} NFT
                  {selectedFractions.length !== 1 ? "s" : ""} included
                </Badge>
              </div>
            </div>
          </Card>

          {/* Vote Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Vote className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Vote for NGO
              </h2>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6">
              Choose which NGO will handle the cleanup. Your{" "}
              <span className="font-semibold text-primary">
                {votingPower.toLocaleString()} votes
              </span>{" "}
              will be added to your selected NGO.
            </p>

            <RadioGroup value={selectedNGO} onValueChange={setSelectedNGO}>
              {ngosWithVotes.length === 0 ? (
                <EmptyState
                  icon={Vote}
                  title="No NGOs available"
                  description="There are no NGOs available for voting at the moment. Please check back later."
                />
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {ngosWithVotes.map((ngo) => {
                    const isSelected = selectedNGO === String(ngo.id);
                    const displayVotes = getUpdatedVotes(ngo.id);
                    const displayPercentage = getUpdatedPercentage(ngo.id);
                    const votePercentage =
                      totalVotes > 0 ? (ngo.votes / totalVotes) * 100 : 0;

                    return (
                      <div key={ngo.id} className="relative">
                        <Label
                          htmlFor={`ngo-${ngo.id}`}
                          className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-card"
                          }`}
                        >
                          {/* Progress bar background */}
                          <div
                            className={`absolute inset-0 rounded-lg transition-all duration-500 ${
                              isSelected
                                ? "bg-gradient-to-r from-primary/20 to-primary-glow/20"
                                : "bg-gradient-to-r from-primary/10 to-primary-glow/10 opacity-50"
                            }`}
                            style={{
                              width: `${
                                isSelected ? displayPercentage : votePercentage
                              }%`,
                            }}
                          />

                          {/* Content */}
                          <div className="relative z-10 flex items-start gap-3 sm:gap-4 flex-1">
                            <RadioGroupItem
                              value={String(ngo.id)}
                              id={`ngo-${ngo.id}`}
                              className="mt-1"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-3 mb-2 sm:mb-3">
                                <img src={ngo.logo} className="h-8 w-8" />

                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-base sm:text-lg md:text-xl text-foreground">
                                    {ngo.name}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {ngo.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mt-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant={
                                      isSelected ? "default" : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {displayVotes.toLocaleString()} votes
                                    {isSelected && (
                                      <span className="ml-1 text-primary-foreground/80">
                                        (+{votingPower.toLocaleString()})
                                      </span>
                                    )}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {displayPercentage.toFixed(1)}%
                                    {isSelected &&
                                      displayPercentage !== votePercentage && (
                                        <span className="ml-1 text-primary">
                                          ↑
                                        </span>
                                      )}
                                  </Badge>
                                </div>
                                <a
                                  href={ngo.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playSound("click");
                                  }}
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  Learn more{" "}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sticky z-10 bottom-4 sm:bottom-6 bg-background/95 backdrop-blur-lg p-3 sm:p-4 rounded-lg border border-border shadow-lg">
            <Button
              variant="outline"
              onClick={() => {
                playSound("click");
                resetDonationState();
                navigate(`/app`);
              }}
              className="w-full sm:w-auto order-2 sm:order-1"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedNGO || donationMutation.isPending}
              className="w-full sm:flex-1 order-1 sm:order-2 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white border-0 shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_35px_rgba(147,51,234,0.7)] transition-all hover:scale-[1.02]"
              size="lg"
            >
              {donationMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  <span className="text-sm sm:text-base">{processingStep || "Processing..."}</span>
                </>
              ) : selectedNGO ? (
                <>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">✨ Confirm & Donate to{" "}
                  {selectedNGOData?.name} ✨</span>
                </>
              ) : (
                <span className="text-sm sm:text-base">Select an NGO to Continue</span>
              )}
            </Button>
          </div>
        </div>
      </main>

      <DonationSuccessDialog
        open={showSuccessDialog}
        onOpenChange={handleSuccessClose}
        selectedFractions={selectedFractions.length}
        totalPrice={totalPrice}
        currency={currency}
        ngoName={selectedNGOData?.name || ""}
        roundType={roundMetadata?.type}
        transactionHash={transactionData?.transactionHash}
        xpEarned={transactionData?.xpEarned}
      />
    </div>
  );
};

export default Donate;
