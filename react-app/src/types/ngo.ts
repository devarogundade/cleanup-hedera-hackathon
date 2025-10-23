/**
 * NGO (Non-Governmental Organization) Types
 */

export interface NGO {
  id: number;
  name: string;
  description: string;
  logo: string;
  website: string;
  votes: number;
}

export interface NGOWithPercentage extends NGO {
  votePercentage: number;
  isWinner?: boolean;
}

export interface WinningNGO {
  id: number;
  name: string;
  votes: number;
  totalVotes: number;
  votePercentage: number;
}
