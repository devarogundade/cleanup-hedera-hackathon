import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import TrashSiteVisualization from "@/components/TrashSiteVisualization";
import DonationPanel from "@/components/DonationPanel";
import TransactionHistory from "@/components/TransactionHistory";
import JoyrideWrapper from "@/components/JoyrideWrapper";
import RoundGallery from "@/components/RoundGallery";
import NGOInfoSection from "@/components/NGOInfoSection";
import UserStatsBarIntegrated from "@/components/UserStatsBarIntegrated";
import DonationStatsBar from "@/components/DonationStatsBar";
import AchievementToast from "@/components/AchievementToast";
import { useApp } from "@/contexts/AppContext";
import { useRound } from "@/hooks/useRounds";

const Index = () => {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const {
    currentRound,
    setCurrentRound,
    achievement,
    setAchievement,
    isRoundEnded,
    resetDonationState,
    lastestRound,
  } = useApp();

  const { data: roundMetadata, isLoading: roundLoading } =
    useRound(currentRound);

  // Sync URL params with context
  useEffect(() => {
    if (roundId) {
      const round = parseInt(roundId);
      if (
        (round >= 1 && round <= lastestRound?.id) ||
        Number.MAX_SAFE_INTEGER
      ) {
        setCurrentRound(round);
      } else {
        navigate(`/app/${lastestRound?.id}`, { replace: true });
      }
    }
  }, [roundId, setCurrentRound, lastestRound, navigate]);

  const handleDonationComplete = () => {
    resetDonationState();
  };

  return (
    <div
      className={`min-h-screen ${
        isRoundEnded ? "bg-[hsl(var(--round-ended-bg))]" : "bg-background"
      }`}
    >
      <JoyrideWrapper />

      <AchievementToast
        achievement={achievement}
        onClose={() => setAchievement(null)}
      />

      <Header />

      <UserStatsBarIntegrated />

      <main className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-8">
        <DonationStatsBar />
        <div className="mb-3 sm:mb-4 md:mb-8">
          {isRoundEnded && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-muted border border-border rounded-lg">
              <p className="text-sm sm:text-base md:text-lg font-semibold text-muted-foreground">
                ⚠️ Round {currentRound} has ended - This is a historical view
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Donations are closed for this round. Navigate to Round{" "}
                {lastestRound?.id} to participate in the current cleanup.
              </p>
            </div>
          )}

          <p className="text-sm sm:text-base md:text-xl text-muted-foreground animate-fade-in">
            {roundMetadata?.type === "tree-planting"
              ? "Select areas to fund tree planting, vote for NGOs, and receive NFTs for your contribution"
              : "Select areas to donate, vote for NGOs, and receive NFTs for your contribution"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {roundMetadata && (
              <TrashSiteVisualization roundMetadata={roundMetadata!} />
            )}
          </div>

          <div>
            <DonationPanel
              roundEnded={isRoundEnded}
              roundMetadata={roundMetadata}
              onDonationComplete={handleDonationComplete}
            />
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <RoundGallery />
        </div>

        <div className="mb-6 sm:mb-8">
          <NGOInfoSection
            roundEnded={isRoundEnded}
            roundMetadata={roundMetadata}
          />
        </div>

        <TransactionHistory />
      </main>
    </div>
  );
};
export default Index;
