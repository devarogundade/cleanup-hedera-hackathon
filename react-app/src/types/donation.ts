/**
 * Donation Types
 */

export type Currency = "HBAR" | "NGN";

export interface DonationAmount {
  amount: number;
  currency: Currency;
  amountInHBAR: number;
  amountInNGN: number;
}

export interface Donation {
  id: string;
  userId: string;
  roundId: number;
  fractionIds: number[];
  amount: DonationAmount;
  ngoId: number;
  votingPower: number;
  transactionHash: string;
  nftTokenIds: string[];
  xpEarned: number;
  createdAt: string;
  status: "pending" | "confirmed" | "failed";
}

export interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  totalFractions: number;
  totalNFTs: number;
  totalXP: number;
  roundsParticipated: number;
}

export interface DonationRequest {
  roundId: number;
  fractionIds: number[];
  amount: number;
  currency: Currency;
  ngoId: number;
}

export interface DonationResponse {
  success: boolean;
  donation?: Donation;
  transactionHash?: string;
  xpEarned?: number;
  nftTokenIds?: string[];
  error?: string;
}
