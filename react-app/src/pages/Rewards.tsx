import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Gift,
  Award,
  TrendingUp,
  CheckCircle2,
  Lock,
  Trophy,
  Package,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Header from "@/components/Header";
import { useSettings } from "@/contexts/SettingsContext";
import type { DeliveryInfo, Reward } from "@/types/reward";
import RewardClaimDialog from "@/components/RewardClaimDialog";
import { useUserRewards, useClaimReward, useRewardStats } from "@/hooks/useRewards";
import { LoadingState, TableLoadingState, StatsLoadingState } from "@/components/LoadingState";
import useHashConnect from "@/hooks/useHashConnect";
import { useProfile } from "@/hooks/useProfile";

const Rewards = () => {
  const navigate = useNavigate();
  const { playSound } = useSettings();
  const { accountId } = useHashConnect();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: rewards = [], isLoading: rewardsLoading } =
    useUserRewards(accountId);
  const { data: profile, isLoading: profileLoading } = useProfile(accountId);
  const { data: rewardsStats, isLoading: statsLoading } = useRewardStats(accountId);
  const claimReward = useClaimReward();

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "common":
        return "text-muted-foreground";
      case "rare":
        return "text-blue-500";
      case "epic":
        return "text-purple-500";
      case "legendary":
        return "text-amber-500";
      default:
        return "text-primary";
    }
  };

  const getRarityBadgeVariant = (
    rarity?: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (rarity) {
      case "legendary":
        return "default";
      case "epic":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(rewards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRewards = rewards.slice(startIndex, endIndex);

  const handleClaimClick = (reward: Reward) => {
    setSelectedReward(reward);
    setIsClaimDialogOpen(true);
  };

  const handleClaim = async (rewardId: number, deliveryInfo?: DeliveryInfo) => {
    try {
      await claimReward.mutateAsync({ accountId, rewardId });
      playSound("success");
      setIsClaimDialogOpen(false);
    } catch (error) {
      console.error("Failed to claim reward:", error);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (rewardsLoading || profileLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
          <LoadingState variant="card" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        {/* Header Section */}
        <div className="flex justify-between">
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Rewards & Givebacks
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-1">
                  Claim your rewards for supporting environmental cleanup
                  initiatives
                </p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/app/1")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Button>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8">
            <StatsLoadingState />
            <StatsLoadingState />
            <StatsLoadingState />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-foreground flex-shrink-0" />
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                  Available
                </p>
              </div>
              <div className="w-16 sm:w-20 h-px bg-border/50 mb-2"></div>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">
                {rewardsStats?.available || 0}
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-foreground flex-shrink-0" />
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                  Claimed
                </p>
              </div>
              <div className="w-16 sm:w-20 h-px bg-border/50 mb-2"></div>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">
                {rewardsStats?.claimed || 0}
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-foreground flex-shrink-0" />
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                  Total Value
                </p>
              </div>
              <div className="w-16 sm:w-20 h-px bg-border/50 mb-2"></div>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">
                {(rewardsStats?.totalValue || 0).toFixed(2)} HBAR
              </p>
            </div>
          </div>
        )}

        {/* Rewards Table */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-muted/50">
                  <TableHead className="text-xs sm:text-sm font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold">
                    Type
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold">
                    Reward
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm font-semibold">
                    Description
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold">
                    Progress
                  </TableHead>
                  <TableHead className="hidden lg:table-cell text-xs sm:text-sm font-semibold">
                    Value
                  </TableHead>
                  <TableHead className="hidden xl:table-cell text-xs sm:text-sm font-semibold">
                    Rarity
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm font-semibold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewardsLoading ? (
                  <TableLoadingState rows={itemsPerPage} />
                ) : paginatedRewards.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">
                        No rewards yet
                      </p>
                      <p className="text-sm">
                        Start donating to unlock rewards and achievements!
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRewards.map((reward) => {
                    const isPhysical =
                      reward.title.toLowerCase().includes("trophy") ||
                      reward.title.toLowerCase().includes("award");

                    return (
                      <TableRow
                        key={reward.id}
                        className={`border-border transition-all ${
                          reward.claimed
                            ? "bg-primary/5 hover:bg-muted/30"
                            : reward.status === "locked"
                            ? "opacity-60 hover:bg-muted/30"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        {/* Status */}
                        <TableCell className="py-4">
                          {reward.claimed ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : reward.status === "locked" ? (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-primary/50" />
                          )}
                        </TableCell>

                        {/* Type */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            {reward.type === "badge" && (
                              <Award className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                            {reward.type === "achievement" && (
                              <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                            {reward.type === "reward" &&
                              (isPhysical ? (
                                <Package className="w-5 h-5 text-primary flex-shrink-0" />
                              ) : (
                                <Gift className="w-5 h-5 text-primary flex-shrink-0" />
                              ))}
                            <span className="capitalize text-xs sm:text-sm hidden sm:inline">
                              {reward.type}
                            </span>
                          </div>
                        </TableCell>

                        {/* Reward Title */}
                        <TableCell className="font-semibold text-sm py-4 min-w-[150px]">
                          <div className="flex items-center gap-2">
                            {reward.title}
                            {isPhysical && (
                              <Badge variant="outline" className="text-xs">
                                <Package className="w-3 h-3 mr-1" />
                                Physical
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Description */}
                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs sm:text-sm py-4 max-w-[250px]">
                          {reward.description}
                        </TableCell>

                        {/* Progress */}
                        <TableCell className="py-4 min-w-[100px]">
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-primary">
                              {reward.progress}
                            </span>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className="bg-gradient-primary h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    (reward.progressCurrent /
                                      reward.progressTotal) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>

                        {/* Value */}
                        <TableCell className="hidden lg:table-cell font-medium text-primary text-xs sm:text-sm py-4">
                          {reward.value}
                        </TableCell>

                        {/* Rarity */}
                        <TableCell className="hidden xl:table-cell py-4">
                          {reward.rarity && (
                            <Badge
                              variant={getRarityBadgeVariant(reward.rarity)}
                              className={`${getRarityColor(
                                reward.rarity
                              )} text-xs`}
                            >
                              <Star className="w-3 h-3 mr-1" />
                              {reward.rarity}
                            </Badge>
                          )}
                        </TableCell>

                        {/* Action */}
                        <TableCell className="py-4">
                          <Button
                            variant={reward.claimed ? "outline" : "default"}
                            size="sm"
                            disabled={
                              reward.claimed || reward.status !== "available"
                            }
                            className={`text-xs whitespace-nowrap ${
                              !reward.claimed && reward.status === "available"
                                ? "bg-gradient-primary border-0"
                                : ""
                            }`}
                            onClick={() => handleClaimClick(reward)}
                          >
                            {reward.claimed ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Claimed
                              </>
                            ) : reward.status === "locked" ? (
                              <>
                                <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Locked
                              </>
                            ) : (
                              "Claim"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="border-t border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(endIndex, rewards.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {rewards.length}
              </span>{" "}
              rewards
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-8"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 p-0 ${
                        currentPage === page
                          ? "bg-gradient-primary border-0"
                          : ""
                      }`}
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-8"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <RewardClaimDialog
        open={isClaimDialogOpen}
        onOpenChange={setIsClaimDialogOpen}
        reward={selectedReward}
        onClaim={handleClaim}
      />
    </div>
  );
};

export default Rewards;
