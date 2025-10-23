import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Medal,
  TrendingUp,
  Zap,
  Award,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLeaderboard, useLeaderboardStats } from "@/hooks/useLeaderboard";
import { LoadingState, TableLoadingState, StatsLoadingState } from "@/components/LoadingState";
import { TableEmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: leaderboardData = [], isLoading: leaderboardLoading } =
    useLeaderboard(100);
  const { data: stats, isLoading: statsLoading } = useLeaderboardStats();

  const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = leaderboardData.slice(startIndex, startIndex + itemsPerPage);
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-700" />;
      default:
        return null;
    }
  };
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-amber-500";
      case 2:
        return "bg-gradient-to-r from-slate-400 to-slate-500";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-700";
      default:
        return "bg-muted";
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-[60px] sm:h-[70px] flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <Link to="/app/1">
            <Button
              variant="default"
              className="gap-2 bg-gradient-primary border-0"
            >
              Launch App
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary flex-shrink-0" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Leaderboard
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Top environmental champions making the biggest impact on our
            platform
          </p>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8">
            <StatsLoadingState />
            <StatsLoadingState />
            <StatsLoadingState />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1 sm:gap-2 mb-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-foreground flex-shrink-0" />
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                  Total Donations
                </p>
              </div>
              <div className="w-16 sm:w-20 h-px bg-border/50 mb-2"></div>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">
                {stats?.totalDonations.toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1 sm:gap-2 mb-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-foreground flex-shrink-0" />
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                  Total HBAR Donated
                </p>
              </div>
              <div className="w-16 sm:w-20 h-px bg-border/50 mb-2"></div>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">
                {stats?.totalHBAR} HBAR
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1 sm:gap-2 mb-2">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-foreground flex-shrink-0" />
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                  Active Warriors
                </p>
              </div>
              <div className="w-16 sm:w-20 h-px bg-border/50 mb-2"></div>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">
                {stats?.activeWarriors}
              </p>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b bg-muted/30">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Top Contributors
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Donations</TableHead>
                  <TableHead className="text-right">Amount (HBAR)</TableHead>
                  <TableHead className="text-right">NFTs</TableHead>
                  <TableHead className="text-right">XP</TableHead>
                  <TableHead className="text-right">Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardLoading ? (
                  <TableLoadingState rows={itemsPerPage} />
                ) : paginatedData.length === 0 ? (
                  <TableEmptyState
                    icon={Trophy}
                    title="No leaderboard data yet"
                    description="Be the first to make an impact by donating to environmental cleanup!"
                    colSpan={7}
                  />
                ) : (
                  paginatedData.map((entry) => (
                    <TableRow
                      key={entry.rank}
                      className={`hover:bg-muted/50 transition-colors ${
                        entry.rank <= 3 ? "bg-muted/20" : ""
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-10 h-10 rounded-full ${getRankBadge(
                              entry.rank
                            )} flex items-center justify-center font-bold text-white`}
                          >
                            {entry.rank <= 3
                              ? getRankIcon(entry.rank)
                              : entry.rank}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={entry.avatarUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {entry.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">
                              {entry.username}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {entry.userId.substring(0, 6)}...
                              {entry.userId.substring(entry.userId.length - 4)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {entry.totalDonations}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {entry.totalAmount.toFixed(2)} ℏ
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{entry.nftsCollected}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {entry.xp.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-gradient-primary border-0">
                          Lv {entry.level}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!leaderboardLoading && paginatedData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={leaderboardData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </Card>

        {/* CTA Section */}
      </main>
    </div>
  );
};
export default Leaderboard;
