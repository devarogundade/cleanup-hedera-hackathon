import { Card } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useRound } from "@/hooks/useRounds";
import { StatsLoadingState } from "@/components/LoadingState";

const DonationStatsBar = () => {
  const { currentRound: round } = useApp();
  const { data: roundData, isLoading } = useRound(round);

  const totalDonations = roundData?.totalDonations || 0;
  const totalWithdrawals = roundData?.totalWithdrawals || 0;
  const netBalance = totalDonations - totalWithdrawals;

  if (isLoading) {
    return (
      <div className="mb-3 sm:mb-4">
        <div className="grid grid-cols-3 gap-6 sm:gap-8">
          <StatsLoadingState />
          <StatsLoadingState />
          <StatsLoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 sm:mb-4">
      <div className="grid grid-cols-3 gap-6 sm:gap-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1 sm:gap-2 mb-2">
            <ArrowDownCircle className="w-3 h-3 sm:w-4 sm:h-4 text-foreground flex-shrink-0" />
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Total Donations</p>
          </div>
          <div className="w-16 sm:w-20 h-px bg-border/50 mb-2"></div>
          <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">
            {totalDonations.toFixed(2)} HBAR
          </p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1 sm:gap-2 mb-2">
            <ArrowUpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-foreground flex-shrink-0" />
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Total Withdrawals</p>
          </div>
          <div className="w-16 sm:w-20 h-px bg-border/50 mb-2"></div>
          <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">
            {totalWithdrawals.toFixed(2)} HBAR
          </p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1 sm:gap-2 mb-2">
            <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-foreground flex-shrink-0" />
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Net Balance</p>
          </div>
          <div className="w-16 sm:w-20 h-px bg-border/50 mb-2"></div>
          <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">
            {netBalance.toFixed(2)} HBAR
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationStatsBar;
