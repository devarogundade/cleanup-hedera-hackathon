export interface RoundMetadata {
  id: number;
  type: "ocean-cleanup" | "waste-cleanup" | "tree-planting";
  creationTime: string;
  endedTime: string | null;
  contractAddress: string;
  isActive: boolean;
  totalFractions: number;
  totalDonations?: number;
  totalWithdrawals?: number;
  location: {
    name: string;
    coordinates: string;
    description: string;
  };
  imageUrl: string;
  unitValue: number;
  winningNGO?: {
    id: number;
    name: string;
    votes: number;
    totalVotes: number;
  };
  stats?: RoundStats;
}

export interface RoundStats {
  totalDonations: number;
  totalAmount: number;
  totalFractions: number;
  totalVotes: number;
  participantCount: number;
  nftsMinted: number;
}

export interface RoundProgress {
  roundId: number;
  percentage: number;
  daysRemaining?: number;
  hoursRemaining?: number;
  isEnded: boolean;
}
