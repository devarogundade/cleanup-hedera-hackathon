import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Users,
  TrendingUp,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import type { NGOWithPercentage } from "@/types/ngo";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useApp } from "@/contexts/AppContext";
import { useNGOs, useNGOVotes } from "@/hooks/useNGOs";
import { RoundMetadata } from "@/types";

interface NGOInfoSectionProps {
  roundEnded: boolean;
  roundMetadata: RoundMetadata;
}

const NGOInfoSection = ({ roundEnded, roundMetadata }: NGOInfoSectionProps) => {
  const { currentRound: round } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const { data: ngos } = useNGOs();
  const { data: votesByNgo } = useNGOVotes(round);

  const ngosWithVotes =
    ngos?.map((ngo) => ({
      ...ngo,
      votes: votesByNgo?.[ngo.id] || 0,
    })) || [];

  const totalVotes = ngosWithVotes.reduce((sum, ngo) => sum + ngo.votes, 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-0 p-3 sm:p-4 md:p-6 transition-all">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 border border-primary/30 rounded-lg">
                {roundEnded ? (
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                ) : (
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                )}
              </div>
              <div className="text-left flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                  {roundEnded ? "Final Results" : "NGO Votes"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  {roundEnded
                    ? "Winner takes all - see the community choice!"
                    : "Your donation = voting power to choose the NGO"}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform flex-shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            {ngosWithVotes?.map((ngo, index) => {
              const votePercentage =
                totalVotes > 0 ? (ngo.votes / totalVotes) * 100 : 0;

              const isWinner =
                roundEnded && roundMetadata?.winningNGO?.id === ngo.id;

              const ngoWithPercentage: NGOWithPercentage = {
                ...ngo,
                votePercentage,
                isWinner,
              };

              return (
                <div
                  key={ngoWithPercentage.id}
                  className={`p-2 sm:p-3 md:p-4 lg:p-5 rounded-lg sm:rounded-xl border-2 transition-all hover:scale-102 ${
                    ngoWithPercentage.isWinner
                      ? "border-primary bg-gradient-to-r from-primary/10 to-primary-glow/10 shadow-[0_8px_24px_hsl(220_10%_50%_/_0.2)] animate-glow-pulse"
                      : "border-border bg-secondary/5 hover:border-primary/50 hover:shadow-[0_4px_16px_hsl(220_10%_50%_/_0.15)]"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                    <img src={ngoWithPercentage.logo} className="h-8 w-8" />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1">
                        <h4 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-foreground">
                          {ngoWithPercentage.name}
                        </h4>
                        {ngoWithPercentage.isWinner && (
                          <Badge
                            variant="default"
                            className="bg-gradient-accent border-0 shadow-[0_4px_12px_hsl(220_10%_50%_/_0.15)] text-xs whitespace-nowrap"
                          >
                            🏆 Winner
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                        {ngoWithPercentage.description}
                      </p>
                      <a
                        href={ngoWithPercentage.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium hover:gap-2 transition-all"
                      >
                        Learn more{" "}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground font-medium whitespace-nowrap">
                          {roundEnded ? "Final" : "Current"}
                        </span>
                      </div>
                      <span className="font-bold text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap">
                        {ngoWithPercentage.votes.toLocaleString()} •{" "}
                        {ngoWithPercentage.votePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={ngoWithPercentage.votePercentage}
                      className="h-2 sm:h-3 shadow-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {!roundEnded && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/30 animate-slide-up">
              <p className="text-xs sm:text-sm text-center font-medium">
                💡{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">
                  Pro Tip:
                </span>{" "}
                Your donation amount determines your voting power. Select
                fractions and choose your NGO to cast your vote!
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default NGOInfoSection;
